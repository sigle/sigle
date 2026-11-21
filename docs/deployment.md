# Deployment

Every app is hosted on [Railway](https://railway.com/), in the `sigle-v2` project. Its `testnet` environment runs:

| Service       | App           | Domain                        |
| ------------- | ------------- | ----------------------------- |
| `web`         | `apps/sigle`  | `testnet.sigle.io`            |
| `server`      | `apps/server` | `testnet-api.sigle.io`        |
| `docs`        | `apps/docs`   | `docs-testnet.up.railway.app` |
| `postgres-db` | PostgreSQL    | private network only          |

## Deploys

Railway deploys a service on every push to `main` that changes one of its watched paths, once the GitHub checks of the commit pass. `web` and `server` are built from their `Dockerfile`, `docs` with Railpack.

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

- **References** to other services, such as the server's `DATABASE_URL`, are set in `.railway/railway.ts`.

## Tracing

`web` and `server` send their traces to Railway, where they appear on the project's **Traces** page next to the spans of Railway's edge. One trace follows a request from the edge through the website, into the API calls it makes, and down to the server's SQL queries.

- Tracing is switched on per service with `tracing` in [`.railway/railway.ts`](../.railway/railway.ts). On the next deploy Railway adds the `OTEL_*` variables the apps export with.
- The server exports its Effect spans with Effect's OTLP exporter (`apps/server/src/services/telemetry.ts`). It also needs `OTEL_TRACES_EXPORTER=otlp`, which Railway doesn't set, so it is set in `.railway/railway.ts`.
- The website exports Next.js spans with `@vercel/otel` (`apps/sigle/src/instrumentation.ts`), and sends the trace context to the API on server-side `fetch` calls.
- Without the `OTEL_*` variables, such as in local development, neither app exports anything.
- Sentry keeps reporting errors. When the server also has `SENTRY_DSN`, its spans go to Railway rather than Sentry.
