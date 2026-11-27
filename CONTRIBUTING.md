# Contributing to Sigle

We're open to all community contributions! This includes bug reports, feature requests, ideas, pull requests. If you are unsure about anything, just ask us in Discord, we're happy to help!

## Requirements

- [Node](https://nodejs.org/en/) 26+
- [pnpm](https://pnpm.io/) 12+

## Pull Requests

For non-bug-fixes, please open an issue first and discuss your idea to make sure we're on the same page.

**Before submitting a pull request**, please make sure the following is done:

- Fork the repository and create a new branch from `main`.
- Must not break the test suite. If you're fixing a bug, include a test that would fail without your fix (`pnpm test`).
- Must pass the format, lint and type checks (`pnpm vp check`; `pnpm vp check --fix` fixes format and lint).
- Must be **isolated**. Avoid grouping many, unrelated changes in a single PR.

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

It stores its data in the SQLite database `apps/server/.data/sigle.db` and applies the migrations on startup. To start over, stop the server, delete the `apps/server/.data` directory and start the server again.

To start the website (http://localhost:3000):

```sh
cd apps/sigle && pnpm dev
```

### Create a database migration

After changing `apps/server/src/db/schema.ts`, generate a Drizzle migration:

```sh
cd apps/server && pnpm drizzle-kit generate --name <migration-name>
```

### Run the end-to-end tests

The website has a [Playwright](https://playwright.dev/) suite in `apps/sigle/e2e`. It drives a browser against a production build of the website and the real API, and calls no outside service: the API runs with an in-memory database and test doubles for Arweave, R2, BNS, OpenTimestamps and PostHog (`apps/server/src/test/e2e-server.ts`), and the browser gets a wallet that signs with a throwaway testnet key (`apps/sigle/e2e/wallet.ts`).

Install the browser once:

```sh
pnpm --filter @sigle/sigle exec playwright install chromium
```

Then run the suite from the root directory:

```sh
pnpm e2e
```

It builds the website, then starts it on http://localhost:3100 and the API on http://localhost:3101, so it runs next to the development servers. To run one file, or to reuse the build of the previous run:

```sh
cd apps/sigle
pnpm e2e auth.test.ts
E2E_SKIP_BUILD=1 pnpm e2e
```

A failed test leaves a trace in `apps/sigle/test-results`, open it with `pnpm exec playwright show-trace <trace.zip>`.
