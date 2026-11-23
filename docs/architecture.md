# Architecture

The Sigle monorepo is composed of the following components:

## Third party dependencies

- [Railway](https://railway.com/) - Hosting for all applications via Docker, see [Deployment](./deployment.md).
- [Plausible](https://plausible.io/) - Privacy protecting analytics.
- [PostHog](https://posthog.com/) - Product analytics and error tracking.
- [Filebase](https://filebase.com/) - IPFS file uploads (S3-compatible).
- [Arweave](https://arweave.org/) - Arweave bundler.
- [Hiro](https://hiro.so/) - Stacks blockchain API.

## Client

A React.js application that serves as the frontend for the Sigle service. It is responsible for rendering the UI and handling user interactions. We are using Next.js as a framework to handle SSR so blogs can be properly read by SEO crawlers. It is also responsible for the user authentication using better-auth.

## Server

A Node.js application built with [Effect](https://effect.website/) that serves as the backend for the Sigle service. It serves the API, stores its data in SQLite (Node's built-in `node:sqlite`) with Drizzle, and runs the background jobs on a queue backed by the same database. Litestream backs the database up to R2.
Rate limiting is kept in memory: every limit is a one-minute window, and the server runs as a single instance. Each endpoint has its own limit per user, or per IP when signed out, and every request also counts against a global limit of its IP. IPv6 clients are limited by their /64.

### Authentication

To verify the user's identity, we use better-auth. We ask the user to sign a message following the [Sign in with Stack SIP](https://github.com/stacksgov/sips/pull/70). The user unique identifier (stacks address) is stored in the session as an encrypted JSON Web Tokens (JWE). The server can then extract the address from the JWT and use it to verify the user's identity.

### Arweave key

`server` uploads to Arweave through [Turbo](https://docs.ar.io/build/upload/bundling-services), signing with the Solana key in `ARWEAVE_PRIVATE_KEY`. Uploads are paid with Turbo Credits held by that key's address.

To generate a new key, run in a terminal (requires [Bun](https://bun.sh/)):

```sh
npx solana-keygen@0.3.0
```

From the same output, set `base58` as `ARWEAVE_PRIVATE_KEY`. Buy credits at [console.ar.io/topup](https://console.ar.io/topup). Check the balance with:

```sh
curl "https://payment.ardrive.io/v1/account/balance/solana?address=<address>"
```

## Data Flow

The content lifecycle from editor to reader:

1. **Draft creation** — Content is written in the editor and saved as drafts in the database.
2. **Metadata upload** — Post metadata (JSON) is signed with the user's Stacks wallet and uploaded to Arweave, tagged with the IPFS CID.
3. **Notarization** — Published posts are notarized with OpenTimestamps.
4. **Indexing** — Indexer jobs fetch metadata and resolve the Arweave L1 transaction to populate the database.
5. **Content rendering** — The web client fetches post metadata from the API and renders the formatted content.
