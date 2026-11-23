# Deployment

Every app is hosted on [Railway](https://railway.com/), in the `sigle-v2` project. Its `testnet` environment runs:

| Service  | App           | Domain                        |
| -------- | ------------- | ----------------------------- |
| `web`    | `apps/sigle`  | `testnet.sigle.io`            |
| `server` | `apps/server` | `testnet-api.sigle.io`        |
| `docs`   | `apps/docs`   | `docs-testnet.up.railway.app` |

## Deploys

Railway deploys a service on every push to `main` that changes one of its watched paths, once the GitHub checks of the commit pass. `web` and `server` are built from their `Dockerfile`, `docs` with Railpack.

`server` has a volume, so Railway stops the running deployment before starting the new one: the API is down for a few seconds on each deploy, and the service runs a single replica.

## Database and backups

`server` stores its data in a SQLite database on its `server-volume` volume, at `/data/sigle.db`. [Litestream](https://litestream.io) runs beside the server (`apps/server/start.sh`) and ships the database to its own R2 bucket: changes every minute, a full snapshot every day, and the last changes when the server stops (on a deploy or when it sleeps). Snapshots are kept 30 days. Losing the volume loses about the last minute of writes. Litestream logs each failed upload as an error.

Backups are off while `LITESTREAM_BUCKET` is unset. The bucket and its token (`LITESTREAM_ACCESS_KEY_ID`, `LITESTREAM_SECRET_ACCESS_KEY`), allowed to read and write that bucket only, are created by the [Cloudflare configuration](#cloudflare-configuration).

When the volume has no database, such as a new or wiped volume, `start.sh` restores the latest backup before starting the server. To roll back to the latest backup, wipe `server-volume` from its settings in the Railway dashboard; Railway redeploys the service, which restores it.

To read the database at an earlier point, restore a copy with the backup credentials, for example on your machine with `R2_ENDPOINT` and the `LITESTREAM_*` variables set:

```sh
litestream restore -config apps/server/litestream.yml -timestamp 2026-11-02T10:00:00Z -o sigle.db "$DATABASE_PATH"
```

Set `DATABASE_PATH` to any path, it only picks the database entry in the config. Restore points begin at the oldest daily snapshot still kept.

`server` sleeps after 5 to 10 minutes without outbound traffic. Its background jobs (profile indexing, OpenTimestamps upgrades, retries) wait until the next request wakes it.

## Infrastructure

The infrastructure is defined in code in three places. None of them runs on merge: after changing one, apply it from your machine.

| What                                                  | Defined in                                        | Applied with                  |
| ----------------------------------------------------- | ------------------------------------------------- | ----------------------------- |
| Railway services, volume, domains, non-R2 variables   | [`.railway/railway.ts`](../.railway/railway.ts)   | `railway config apply`        |
| R2 buckets and their tokens, DNS, R2 server variables | [`infra/alchemy.run.ts`](../infra/alchemy.run.ts) | `alchemy deploy`              |
| Other secrets (`AUTH_SECRET`, `ARWEAVE_PRIVATE_KEY`…) | 1Password Environments                            | `scripts/sync-railway-env.sh` |

To set up a new environment, run them in that order: Railway creates the services and gives each custom domain its CNAME target, Alchemy then creates the R2 resources and DNS records and sets the server's R2 variables, and the sync script adds the other secrets and redeploys.

## Railway configuration

The services, their build and deploy settings, domains and variables are defined in [`.railway/railway.ts`](../.railway/railway.ts) ([Railway Infrastructure as Code](https://docs.railway.com/infrastructure-as-code)). Change the file instead of the Railway dashboard, then apply it, signed in with `railway login`:

```sh
railway config plan   # preview the changes
railway config apply  # apply them
```

## Cloudflare configuration

[`infra/alchemy.run.ts`](../infra/alchemy.run.ts) is an [Alchemy](https://alchemy.run) stack, one stage per environment (`testnet`). It manages:

- **The media bucket**, public on `testnet-files.sigle.io`, and the backup bucket, with its lifecycle rule. Both are protected: Alchemy refuses a plan that would delete or replace them.
- **One API token per bucket**, allowed to read and write that bucket's objects only. R2 uses the token ID as the access key ID and the SHA-256 of the token value as the secret access key.
- **The DNS records** of `testnet.sigle.io` and `testnet-api.sigle.io`, CNAMEs to the targets Railway assigned to the domains, proxied by Cloudflare.
- **The server's R2 variables on Railway**: `R2_*` and `LITESTREAM_*`. Alchemy sets them without redeploying, so redeploy `server` after a change to them:

  ```sh
  railway redeploy --project 8d9c9801-6167-42e8-85a0-2b5d9a322649 --environment testnet --service server
  ```

  They are listed with `preserve()` in `.railway/railway.ts` so an apply keeps them, and they must not be in 1Password, or the sync script overwrites them.

Alchemy needs a Cloudflare account and a Railway account, saved in a profile (`~/.alchemy/profiles.json`) on the first run:

```sh
pnpm --dir infra exec alchemy profile edit --add Cloudflare --add Railway
```

The Cloudflare login needs the **API Tokens Write** account permission to create the bucket tokens. Without a profile, Alchemy reads `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` and `RAILWAY_API_TOKEN`.

Then preview and apply the changes:

```sh
pnpm --dir infra exec alchemy plan --stage testnet
pnpm --dir infra exec alchemy deploy --stage testnet
```

The state, which resources the stack created and their IDs, is stored in a Worker, `alchemy-state-store`, that the first run deploys to the Cloudflare account. Every machine shares it.

## Environment variables

- **Non-secret values** are committed in each app's `.env.testnet`. The website builds it into the image; the server loads it on startup, and variables set on Railway take precedence.
- **R2 variables** (`R2_*`, `LITESTREAM_*`) are set by the [Cloudflare configuration](#cloudflare-configuration).
- **Other secrets** are stored in 1Password Environments and copied to Railway with [`scripts/sync-railway-env.sh`](../scripts/sync-railway-env.sh), which redeploys the service. It needs the 1Password CLI, signed in through the desktop app, and the Railway CLI:

  ```sh
  scripts/sync-railway-env.sh testnet          # every service
  scripts/sync-railway-env.sh testnet server   # one service
  ```

  `.railway/railway.ts` owns every variable of the services it declares, so a new secret must also be listed there with `preserve()`, or the next apply deletes it.

- **References** to other services are set in `.railway/railway.ts`.

## Private network

The website's server-side calls to the API (page renders, the RSS feed, Open Graph images) go to `API_INTERNAL_URL`, the server on Railway's private network, instead of the public `NEXT_PUBLIC_API_URL`. The browser keeps calling the public URL.

The API rate limits clients by IP, but these calls come from the website for every visitor at once, so the API doesn't rate limit GET requests addressed to its private domain (`RAILWAY_PRIVATE_DOMAIN`, set by Railway). Railway's edge answers requests for a `*.railway.internal` host itself, so only the project's services can send one. Other methods stay limited, whoever calls them. Page floods are not limited by the API this way; limit them in front of the website instead.

## Tracing

`web` and `server` send their traces to Railway, where they appear on the project's **Traces** page next to the spans of Railway's edge. One trace follows a request from the edge through the website, into the API calls it makes, and down to the server's SQL queries.

- Tracing is switched on per service with `tracing` in [`.railway/railway.ts`](../.railway/railway.ts). On the next deploy Railway adds the `OTEL_*` variables the apps export with.
- The server exports its Effect spans with Effect's OTLP exporter (`apps/server/src/services/telemetry.ts`). It also needs `OTEL_TRACES_EXPORTER=otlp`, which Railway doesn't set, so it is set in `.railway/railway.ts`.
- The website exports Next.js spans with `@vercel/otel` (`apps/sigle/src/instrumentation.ts`), and sends the trace context to the API on server-side `fetch` calls.
- Without the `OTEL_*` variables, such as in local development, neither app exports anything.
- Sentry keeps reporting errors. When the server also has `SENTRY_DSN`, its spans go to Railway rather than Sentry.
