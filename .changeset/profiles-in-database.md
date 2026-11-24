---
"@sigle/server": minor
"@sigle/sdk": minor
"@sigle/sigle": minor
"@sigle/docs": patch
---

Store profiles in the database instead of on Arweave. `PUT /api/me/profile` now takes the profile fields directly (`displayName`, `description`, `website`, `twitter`, `picture`, `coverPicture`, each limited in length and format) and saves them for the user's primary address, with no wallet signature, Arweave upload or daily limit. The Arweave profile indexer, the `profile_update` table, the `profileUpdate` limit of `GET /api/me/limits`, and the profile's `arweaveTxId` are removed, and the SDK no longer exports the profile metadata schema. The new `GET /api/me/profile/bns` reads the profile fields of the zonefile of the user's primary BNS V2 name, and the settings page can import them into the profile form. Avatar and cover images are now stored under their content hash, so uploading a new image never replaces the one behind a URL already in use.
