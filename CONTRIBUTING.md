# Contributing to Sigle

We're open to all community contributions! This includes bug reports, feature requests, ideas, pull requests.

## Requirements

- [Node](https://nodejs.org/en/) 18+
- [pnpm](https://pnpm.io/) 8+
- [Docker](https://www.docker.com/)

## Pull Requests

For non-bug-fixes, please open an issue first and discuss your idea to make sure we're on the same page.

**Before submitting a pull request**, please make sure the following is done:

- Fork the repository and create a new branch from `main`.
- Must not break the test suite (`pnpm run test`). If you're fixing a bug, include a test that would fail without your fix.
- Must be formatted with prettier (`pnpm run prettier`).
- Must be **isolated**. Avoid grouping many, unrelated changes in a single PR.
- Must contain a changeset file describing the changes and affected packages. Run `pnpm changeset` to generate one.

## Structure

Sigle is a monorepo made of 1 next.js application, and one node.js application.:

`sigle` folder - Contains the editor to write and edit your posts
`server` folder - Contains the api

## Development Workflow

To setup the project locally you first need to fork the project on Github (top right on the project page). Then clone the project: `git clone git@github.com:yourname/sigle.git`.

Now you can run run the following command to install the dependencies:

```sh
pnpm install
```

## Setup server

### Set up environment variables

Copy the `env.example` file in the application directory to `.env` (which will be ignored by Git) and setup each variable.

```sh
cd server
cp .env.example .env
```

### Start the databases

We use docker to manage the local postgres database.

```sh
docker compose start
```

### Setup the database

To apply the schemas and seed the database with some data, run the following command:

```sh
pnpm prisma migrate reset
```

### Run the server in development mode

To start the project in development/watch mode run:

```sh
pnpm run dev
```

You can now open your browser and go to http://localhost:3001 to see the api.

## Setup client

### Run Next.js in development mode

To start the project in development/watch mode run:

```sh
pnpm run dev
```

You can now open your browser and go to http://localhost:3000 to see the app.

### Set up custom environment variables

If needed, you can use your own environment variables in development. For this create a `.env.development.local` file in the application directory (which will be ignored by Git) and setup your variables.

### Update the e2e tests snapshots

To update the e2e tests snapshots, run the following command in the sigle directory:

```sh
docker build -t local-playwright-docker --file Dockerfile.e2e ../
docker run -v "./e2e:/app/sigle/e2e" -it local-playwright-docker:latest
```

To update the custom domain e2e tests snapshots, run the following command in the apps/custom-domain directory:

```sh
docker build -t local-custom-domain-playwright-docker --file Dockerfile.e2e ../../
docker run -v "./e2e:/app/apps/custom-domain/e2e" -it local-custom-domain-playwright-docker:latest
```
