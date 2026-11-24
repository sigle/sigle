---
"@sigle/server": minor
"@sigle/sdk": minor
"@sigle/sigle": minor
"@sigle/docs": patch
---

Store profiles in the database instead of on Arweave. `PUT /api/me/profile` now takes the profile fields directly (`displayName`, `description`, `website`, `twitter`, each limited in length and format) and saves them for the user's primary address, with no wallet signature, Arweave upload or daily limit. The Arweave profile indexer, the `profile_update` table, the `profileUpdate` limit of `GET /api/me/limits`, and the profile's `arweaveTxId` are removed, and the SDK no longer exports the profile metadata schema. The new `GET /api/me/profile/bns` reads the name, bio, website and X handle in the zonefile of the user's primary BNS V2 name, and the settings page can import them into the profile form. `PUT /api/me/profile/images/{kind}` now sets the uploaded avatar or cover on the profile right away and returns the profile, like `PUT /api/me/profile`. Images are stored under their content hash, so an upload never replaces the object behind a URL in use, and the image it replaces is deleted.
