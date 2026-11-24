// oxlint-disable typescript/prefer-literal-enum-member
// Served by the docs site. Every published post carries a schema URL, so
// these URLs must keep working forever.
export const SchemasRoot = "https://docs.sigle.io/schemas";

export enum PostMetadataSchemaId {
  LATEST = `${SchemasRoot}/posts/1.0.0.json`,
}
