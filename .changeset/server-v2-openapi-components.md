---
"@sigle/server": minor
"@sigle/sdk": minor
---

Clean up the server-v2 OpenAPI document:

- Authenticated routes declare a `sessionCookie` security scheme (the better-auth session cookie), so Scalar shows an Authorize button and clients can tell them from public routes.
- Error bodies are `{ message }` (plus `retryAfterMillis` on 429) without Effect's `_tag`, under component names like `BadRequestError` instead of `sigle_api_BadRequestEncoded`.
- `HealthResponse`, `CurrentUserResponse`, `UploadProfileMetadataPayload` and `ProfileImageKind` are named components.
- The draft and profile image uploads share one `UploadedImageResponse`.
- `UserProfileResponse` is renamed `PublicUser`, since it is also the post `author`.
- `DateTime` is shared from `api/schemas.ts`.
