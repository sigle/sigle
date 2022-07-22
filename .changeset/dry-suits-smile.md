---
'@sigle/server': minor
---

Add follows system to the api to index Gaia `app-data/following.json` file:

- POST `/api/users/me/following` route.
- DELETE `/api/users/me/following` route.
- GET `/api/users/:userAddress/following` route.
- GET `/api/users/:userAddress/followers` route.
