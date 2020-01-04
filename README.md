<h1 align="center">Sigle</h1>

<p align="center">
  <img src="https://raw.githubusercontent.com/pradel/sigle/master/public/icon-192x192.png" height="50">
</p>

<p align="center">
  A beautiful decentralized and open source blog maker
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/pradel/sigle/master/assets/screens.png">
</p>

<p align="center">
  <img src="https://badgen.net/travis/pradel/sigle" alt="License">
  <img src="https://badgen.net/badge/license/MIT/blue" alt="License">
</p>

## Codebase

Here is a list of the big technologies we use:

- [Blockstack](https://blockstack.org/): Authentication and storage
- [Next.js](https://nextjs.org/): React Framework
- [Tailwind](https://tailwindcss.com/): CSS Framework
- [Slate](https://www.slatejs.org/): Text editor Framework

## Local Development

First you need to clone the repository:

```sh
git clone git@github.com:pradel/sigle.git
```

Then run the following command to install dependencies:

```sh
yarn install
```

We use now to handle the development mode so you will need to install their cli:

```sh
yarn global add now
```

Finally to start the project in development/watch mode run:

```sh
now dev
```

You can now open your browser and go to http://localhost:3000 to see the app.

## License

MIT © [Léo Pradel](https://www.leopradel.com/)
