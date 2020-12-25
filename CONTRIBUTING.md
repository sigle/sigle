# Contributing to Sigle

## Requirements

- [Node](https://nodejs.org/en/) 12.0.0+
- [Yarn](https://classic.yarnpkg.com/en/) 1.22.0+
- [Docker](https://www.docker.com/)

## Pull Requests

For non-bug-fixes, please open an issue first and discuss your idea to make sure we're on the same page.

**Before submitting a pull request**, please make sure the following is done:

- Fork the repository and create a new branch from `master`.
- Must not break the test suite (`yarn test`). If you're fixing a bug, include a test that would fail without your fix.
- Must be formatted with prettier (`yarn prettier`).
- Must be **isolated**. Avoid grouping many, unrelated changes in a single PR.

## Development Workflow

To setup the project locally you first need to fork the project on Github (top right on the project page). Then clone the project: `git clone git@github.com:yourname/sigle.git`.

Now you can run run the following command to install the dependencies:

```sh
yarn install
```

### Set up environment variables

Copy the `env.local.example` file in this directory to `.env.local` (which will be ignored by Git) and setup each variable.

```sh
cp .env.local.example .env.local
```

### Start the database

We use docker to manage the local postgres database.

```sh
docker-compose start
```

### Run Next.js in development mode

To start the project in development/watch mode run:

```sh
yarn dev
```

You can now open your browser and go to http://localhost:3000 to see the app.

## License

Sigle is licensed under the [MIT license](https://github.com/pradel/sigle/blob/master/LICENSE).
