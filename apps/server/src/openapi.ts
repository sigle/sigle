import { OpenApi } from "effect/http-api";
import { SigleApi } from "@/api";

// Prints the OpenAPI document the API serves at /_openapi.json, without
// starting the server or reading its configuration. `pnpm codegen` in
// packages/sdk generates the SDK's types from it.
process.stdout.write(`${JSON.stringify(OpenApi.fromApi(SigleApi))}\n`);
