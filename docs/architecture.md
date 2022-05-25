# Architecture

The Sigle monorepo is composed of the following components:

- **sigle client** - A React.js application that serves as the frontend for the Sigle service. It is responsible for rendering the UI and handling user interactions. We are using Next.js as a framework to handle SSR so blogs can be properly read by SEO crawlers. It is also responsible for the user authentication using next-auth. The client is hosted on Vercel.
- **sigle server** - A Node.js application that serves as the backend for the Sigle service. We use Fastify for the we server responsible for handling the API requests. The server is hosted on render.com.

## Third party dependencies

- [Vercel](https://vercel.com/) - Hosting for the next.js application.
- [Render](https://render.com/) - Hosting for the Node.js application and databases.
- [Fathom](https://usefathom.com/) - Privacy protecting analytics.
- [Sentry](https://sentry.io/) - Track errors.
