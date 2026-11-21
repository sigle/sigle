# Contributing to Sigle

We're open to all community contributions! This includes bug reports, feature requests, ideas, pull requests. If you are unsure about anything, just ask us in Discord, we're happy to help!

## Requirements

- [Node](https://nodejs.org/en/) 24+
- [pnpm](https://pnpm.io/) 10+
- [Docker](https://www.docker.com/) (Docker Compose 2.22.0+)

## Pull Requests

For non-bug-fixes, please open an issue first and discuss your idea to make sure we're on the same page.

**Before submitting a pull request**, please make sure the following is done:

- Fork the repository and create a new branch from `main`.
- Must not break the test suite. If you're fixing a bug, include a test that would fail without your fix (`pnpm test`).
- Must be formatted with oxfmt (`pnpm format:fix`).
- Must be linted with oxlint (`pnpm lint:fix`).
- Must be **isolated**. Avoid grouping many, unrelated changes in a single PR.
- Must contain a changeset file describing the changes and affected packages. Run `pnpm changeset` to generate one.

## Structure

Sigle is a monorepo made of multiple applications and packages:

- `apps` - Contains the apps.
  - `sigle` - Contains the user facing application.
  - `server` - Contains the api.
- `packages` - Contains the shared packages.

## Development Workflow

To setup the project locally you first need to fork the project on Github (top right on the project page). Then clone the project: `git clone git@github.com:yourname/sigle.git`.

Now you can run the following command to install the dependencies:

```sh
pnpm install
```

If you are using AI coding agents, sync the reference repositories (such as Effect) into `./repos` so agents have local access to library source code:

```sh
pnpm repos:sync
```

To start the API server (http://localhost:3001) in watch mode:

```sh
cd apps/server && pnpm dev
```

It uses an embedded PGlite database by default and applies the migrations on startup. To use PostgreSQL instead, start it in Docker with `pnpm db:up` and set `DATABASE_KIND="postgres"` and `DATABASE_URL` in `apps/server/.env.development.local`.

To start the website (http://localhost:3000):

```sh
cd apps/sigle && pnpm dev
```

### Create a database migration

After changing `apps/server/src/db/schema.ts`, generate a Drizzle migration:

```sh
cd apps/server && pnpm drizzle-kit generate --name <migration-name>
```

### Update the e2e tests snapshots

To update the e2e tests snapshots, run the following command from the root directory:

```sh
docker build -t local-playwright-docker --file apps/sigle/Dockerfile.dev .
docker run -v "./apps/sigle/e2e:/app/apps/sigle/e2e" -it local-playwright-docker:latest
```
