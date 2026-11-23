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

Backups are off while `LITESTREAM_BUCKET` is unset. The backup token (`LITESTREAM_ACCESS_KEY_ID`, `LITESTREAM_SECRET_ACCESS_KEY`) is an R2 API token with **Object Read & Write** on that bucket only.

When the volume has no database, such as a new or wiped volume, `start.sh` restores the latest backup before starting the server. To roll back to the latest backup, wipe `server-volume` from its settings in the Railway dashboard; Railway redeploys the service, which restores it.

To read the database at an earlier point, restore a copy with the backup credentials, for example on your machine with `R2_ENDPOINT` and the `LITESTREAM_*` variables set:

```sh
litestream restore -config apps/server/litestream.yml -timestamp 2026-11-02T10:00:00Z -o sigle.db "$DATABASE_PATH"
```

Set `DATABASE_PATH` to any path, it only picks the database entry in the config. Restore points begin at the oldest daily snapshot still kept.

`server` sleeps after 5 to 10 minutes without outbound traffic. Its background jobs (profile indexing, OpenTimestamps upgrades, retries) wait until the next request wakes it.

## Railway configuration

The services, their build and deploy settings, domains and variables are defined in [`.railway/railway.ts`](../.railway/railway.ts) ([Railway Infrastructure as Code](https://docs.railway.com/infrastructure-as-code)). Change the file instead of the Railway dashboard, then sync it:

```sh
railway config plan   # preview the changes
railway config apply  # apply them
```

Railway does not read this file when deploying, so merging a change does nothing until it is applied.

## Environment variables

- **Non-secret values** are committed in each app's `.env.testnet`. The website builds it into the image; the server loads it on startup, and variables set on Railway take precedence.
- **Secrets** are stored in 1Password Environments and copied to Railway with [`scripts/sync-railway-env.sh`](../scripts/sync-railway-env.sh), which redeploys the service:

  ```sh
  scripts/sync-railway-env.sh testnet
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
