# @sigle/server

## 0.6.1

### Patch Changes

- 6a49297: Use client package for Gaia types.
- Updated dependencies [fea4ce2]
  - @sigle/client@0.1.0

## 0.6.0

### Minor Changes

- 4190a9f: Remove micro-stacks and use @stacks/\* packages.
- ddde83a: Move server to apps folder in the monorepo.
- f786ca8: Create new server routes to fetch the gaia files.
- 15f6e3f: Upgrade from node 18 to node 20.

### Patch Changes

- 7d39310: Change the tsconfig to be strict.
- 5d6fb9b: Fix to better handle the case where a user has a free subdomain and a .btc domain linked to the same address.
- b1bbfba: Upgrade packages with many major versions (prisma 5, nestjs/throttler 5, ...)

## 0.5.0

### Minor Changes

- 70bc06f: Add routes to change the mailjet list where you send emails to.
- 6a0094c: Add routes to change the sender address where emails are sent from.
- 1b4307e: Remove whitelist for newsletter.
- 1622d27: Upgrade Nest.js to v10 and use swc.

### Patch Changes

- 823ff8c: Add Enterprise plan.
- 9937ce7: Fix "Read online" email link for custom domain users.
- 7caf4f4: Fix cache module initialisation for redis 4.X.
- 5768f96: Fix cors api calls from custom domains.
- 8ab440f: Change email template font size and spacing.

## 0.4.0

### Minor Changes

- 20a3bab: Create new `/api/newsletter` route to setup the mailjet config.
- 3d9cab2: Create the POST /api/stories/\* routes to manage stories (publish, unpublish, delete).
- 67cb16b: Index stacks username and Gaia info
- 70fe8b8: Send newsletter via mailjet API.
- a1d057b: Start capturing events with posthog:

  - story published
  - story unpublished
  - story deleted
  - newsletter created
  - newsletter updated
  - newsletter sent
  - subscription created
  - subscription updated
  - subscription downgraded
  - follow created
  - follow deleted
  - subscriber created

- e47a331: Change subscription NFT logic.
- 3a1150b: Create the POST /api/email-verification/\* route to let a user link an email to his account.
- 6751b95: Create the POST /api/stories/send-test route to send test emails before publishing.
- 8961a96: Create the POST `/api/subscribers` route to register new subscriber emails.
- 20a3bab: Create new GET `/api/newsletter` route to get the current newsletter.

### Patch Changes

- 5c1ca77: Upgrade to pnpm 8.
- cbcb043: Create prisma module to share the connection.
- 5192abf: Add list support to newsletter.
- 4ffeb6d: Use new Hiro API endpoint.
- f545b3b: Rename email module to bulk-email.
- 54c64e4: Set PrismaModule and PostHogModule as global.
- a06936c: Setup logger by environment.
- 114a5b6: Fix blockquotes not showing in email.
- 1554164: Remove test with username and Gaia url.
- 70fe8b8: Newsletter template for stories.
- d28e6bf: Add button CTA support to newsletter.
- e63ae8e: Fix creating subscription with NFT id already used by another account.
- 44c80ba: Create new `/api/newsletter/sender` route.
- ab6cc78: Add simple Twitter support to newsletter.
- 5b23ad2: Add a new `send` option to the publish story route, and save it to the DB. Create a new route to get a story information.
- cf50285: Add gaia functions for settings and story in the Stacks module.
- 47f9a16: Fix Sentry error reporting when sending emails.
- b9438c0: Create new email table to track the email sent.

## 0.3.0

### Minor Changes

- 3e49ab7: Migrate the codebase to nest.js

## 0.2.0

### Minor Changes

- 3892db5: Add `followersCount` and `followingCount` info to the user route.
- e0b8b67: Save legacy users to the indexer.
- f17096d: New GET `/api/users/explore` route returning a list of users using Sigle.
- ca6b6a3: Add follows system to the api to index Gaia `app-data/following.json` file:

  - POST `/api/users/me/following` route.
  - DELETE `/api/users/me/following` route.
  - GET `/api/users/:userAddress/following` route.
  - GET `/api/users/:userAddress/followers` route.

- 0ef5743: Setup swagger documentation accessible at `/api/documentation`.

### Patch Changes

- 074786f: Add `page` param to explore route.
- 91e7a13: Create script to seed the local database.

## 0.1.0

### Minor Changes

- ddc9bc8: Setup rate limit.
- b9d44ca: Setup cors policy.
- 4a2cf5e: Create route for the creator plus plan.
- 693a6f9: Add authentication support via JWE.
- 4b3f433: Switch to plausible for the analytics API.
- df40d30: Create fastify server template.
- d4e0ffd: Get subscription for current logged in user route.
- a34fb27: Setup postgres DB and user schema.
- bf2bb5a: Migrate analytics API.
- 4cd2424: Create fastify plugin authenticating the user.
- 98f5973: Cache result of the analytics endpoints.

### Patch Changes

- 8359fd7: Route to change the NFT linked to the current subscription.
- 2459689: Protect analytics route to subscribers.
- d2917ae: Create API route to add user data to the indexer.
- 370089c: Setup eslint check.
- 6179e9d: Upgrade prisma to v4.
- fd47222: Upgrade fastify to V4.
