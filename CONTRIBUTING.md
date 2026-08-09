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
  - `custom-domain` - Contains the custom domain app.
  - `server` - Contains the api.
- `packages` - Contains the shared packages.

## Development Workflow

To setup the project locally you first need to fork the project on Github (top right on the project page). Then clone the project: `git clone git@github.com:yourname/sigle.git`.

Now you can run the following command to install the dependencies:

```sh
pnpm install
```

To start the database and backend server in development/watch mode:

```sh
pnpm docker:dev
```

To run the complete full-stack environment in Docker (including Next.js apps):

```sh
pnpm docker:dev:full
```

Alternatively, to run only PostgreSQL in Docker while developing apps locally:

```sh
pnpm db:up
```

### Docker services

| Name                 | Link                  | Profile |
| -------------------- | --------------------- | ------- |
| @sigle/server        | http://localhost:3001 | Default |
| @sigle/sigle         | http://localhost:3000 | `full`  |
| @sigle/custom-domain | http://localhost:3002 | `full`  |
| Prisma Studio        | http://localhost:5555 | `tools` |

### Seed the database (optional)

To apply schemas and seed the database using a one-off server container, run:

```sh
pnpm db:reset
```

Or run directly via Docker Compose:

```sh
docker compose run --rm --build server pnpm prisma migrate reset --force
```

### Create prisma migration

To create a new Prisma migration using a one-off server container:

```sh
pnpm db:migrate --name <migration-name>
```

Or run directly via Docker Compose:

```sh
docker compose run --rm --build server pnpm prisma migrate dev --name <migration-name>
```

### Update the e2e tests snapshots

To update the e2e tests snapshots, run the following command from the root directory:

```sh
docker build -t local-playwright-docker --file apps/sigle/Dockerfile.dev .
docker run -v "./apps/sigle/e2e:/app/apps/sigle/e2e" -it local-playwright-docker:latest
```

To update the custom domain e2e tests snapshots:

```sh
docker build -t local-playwright-docker --file apps/custom-domain/Dockerfile.dev .
docker run -v "./apps/custom-domain/e2e:/app/apps/custom-domain/e2e" -it local-playwright-docker:latest
```
