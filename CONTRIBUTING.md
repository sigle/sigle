# Contributing to Sigle

We're open to all community contributions! This includes bug reports, feature requests, ideas, pull requests. If you are unsure about anything, just ask us in Discord, we're happy to help!

## Requirements

- [Node](https://nodejs.org/en/) 20+
- [pnpm](https://pnpm.io/) 8+
- [Docker](https://www.docker.com/)

## Pull Requests

For non-bug-fixes, please open an issue first and discuss your idea to make sure we're on the same page.

**Before submitting a pull request**, please make sure the following is done:

- Fork the repository and create a new branch from `main`.
- Must not break the test suite. If you're fixing a bug, include a test that would fail without your fix.
- Must be formatted with biome (`pnpm run format`).
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

To start the project in development/watch mode run:

```sh
docker compose up --build --watch
```

This will start the databases and the applications services. You can now open your browser and go to http://localhost:3000 to see the app.

### Docker services

| Name                 | Link                  |
| -------------------- | --------------------- |
| @sigle/app           | http://localhost:3000 |
| @sigle/server        | http://localhost:3001 |
| @sigle/custom-domain | http://localhost:3002 |

### Seed the database (optional)

To apply the schemas and seed the database with some data, run the following command in the `apps/server` directory:

```sh
docker exec $(docker container ls --all | grep -w sigle-server | awk '{print $1}') pnpm prisma migrate reset
```

### Create prisma migration

To create a new prisma migration, run the following command in the `apps/server` directory:

```sh
docker exec $(docker container ls --all | grep -w sigle-server | awk '{print $1}') pnpm prisma migrate dev --name <migration-name>
```

### Update the e2e tests snapshots

To update the e2e tests snapshots, run the following command in the sigle directory:

```sh
docker build -t local-playwright-docker --file Dockerfile.e2e ../../
docker run -v "./e2e:/app/apps/sigle/e2e" -it local-playwright-docker:latest
```

To update the custom domain e2e tests snapshots, run the following command in the apps/custom-domain directory:

```sh
docker build -t local-custom-domain-playwright-docker --file Dockerfile.e2e ../../
docker run -v "./e2e:/app/apps/custom-domain/e2e" -it local-custom-domain-playwright-docker:latest
```
