---
"@sigle/server-v2": patch
---

Share one zod-to-Effect Schema bridge (`fromZod`) for the signed post and profile metadata. The publish endpoint now validates `metadata` at the schema level like the profile endpoint, the publish job decodes through the same schema, and the OpenAPI specification documents both metadata formats with the JSON Schema generated from `@sigle/sdk` instead of an opaque value.
