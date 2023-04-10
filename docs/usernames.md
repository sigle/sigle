# How Sigle handles BNS usernames

## Using .btc BNS names

When logging in with the Hiro wallet, .btc BNS names are not injected in the `username` property [stacks.js#1144](https://github.com/hirosystems/stacks.js/issues/1144). To overcome this, we call the `https://api.hiro.so/v1/addresses/stacks/${address}` endpoint to fetch the names associated with your address and use it as the `username` property.

This is handled in the `sigle/src/modules/auth/AuthContext.tsx` file.

## Registering new free subdomains

In order to provide free usernames when a user register a new account on Sigle we are using the [Stacks BNS subdomains](https://docs.stacks.co/build-apps/references/bns#subdomains).
When you select the username you want to use (`*.id.stx`), we are using the Stack public [subdomain-registrar](https://github.com/stacks-network/subdomain-registrar) to check the availability and register it.

This is handled in the `sigle/src/modules/login/RegisterUsername.tsx` file.
