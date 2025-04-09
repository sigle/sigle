# Architecture

The Sigle monorepo is composed of the following components:

## Third party dependencies

- [Vercel](https://vercel.com/) - Hosting for the next.js application.
- [Render](https://render.com/) - Hosting for the Node.js application and databases.
- [Plausible](https://plausible.io/) - Privacy protecting analytics.
- [Sentry](https://sentry.io/) - Track errors.

## Client

A React.js application that serves as the frontend for the Sigle service. It is responsible for rendering the UI and handling user interactions. We are using Next.js as a framework to handle SSR so blogs can be properly read by SEO crawlers. It is also responsible for the user authentication using better-auth. The client is hosted on Vercel.

## Server

A Node.js application that serves as the backend for the Sigle service. We use Fastify for the we server responsible for handling the API requests. The server is hosted on render.com.
Rate limiting is implemented and uses redis to cache the rate limit information so the server can scale horizontally easily.

## Authentication

To verify the user's identity, we use better-auth. We ask the user to sign a message following the [Sign in with Stack SIP](https://github.com/stacksgov/sips/pull/70). The user unique identifier (stacks address) is stored in the session as an encrypted JSON Web Tokens (JWE). The server can then extract the address from the JWT and use it to verify the user's identity.
