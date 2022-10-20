# @sigle/server

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
