# Architecture

The Sigle monorepo is composed of the following components:

## Third party dependencies

- [Railway](https://railway.com/) - Hosting for all applications via Docker.
- [Plausible](https://plausible.io/) - Privacy protecting analytics.
- [PostHog](https://posthog.com/) - Product analytics.
- [Sentry](https://sentry.io/) - Track errors.
- [Storacha](https://storacha.network/) - IPFS file uploads.
- [Arweave](https://arweave.org/) - Arweave bundler.
- [Hiro](https://hiro.so/) - Stacks blockchain API.

## Client

A React.js application that serves as the frontend for the Sigle service. It is responsible for rendering the UI and handling user interactions. We are using Next.js as a framework to handle SSR so blogs can be properly read by SEO crawlers. It is also responsible for the user authentication using better-auth.

## Server

A Node.js application that serves as the backend for the Sigle service. We use Fastify for the we server responsible for handling the API requests.
Rate limiting is implemented using rate-limiter-flexible backed by PostgreSQL.

### Authentication

To verify the user's identity, we use better-auth. We ask the user to sign a message following the [Sign in with Stack SIP](https://github.com/stacksgov/sips/pull/70). The user unique identifier (stacks address) is stored in the session as an encrypted JSON Web Tokens (JWE). The server can then extract the address from the JWT and use it to verify the user's identity.

## Data Flow

The content lifecycle from editor to reader:

1. **Draft creation** — Content is written in the editor and saved as drafts in PostgreSQL.
2. **Metadata upload** — Post metadata (JSON) is uploaded to Arweave, tagged with the IPFS CID.
3. **On-chain publication** — The user signs a Stacks transaction.
4. **Indexing** — The server registers predicates with Hiro Platform. On-chain events trigger webhooks back to the server. The server listen for events emitted by the contracts.
5. **Job processing** — Indexer jobs fetch metadata and populate PostgreSQL.
6. **Content rendering** — The web client fetches post metadata from the API and renders the formatted content.
