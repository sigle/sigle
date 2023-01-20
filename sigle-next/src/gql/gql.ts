/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel-plugin for production.
 */
const documents = {
    "\n  mutation createPost($input: CreatePostInput!) {\n    createPost(input: $input) {\n      clientMutationId\n    }\n  }\n": types.CreatePostDocument,
    "\n  query getPostsList {\n    viewer {\n      id\n      postList(first: 10) {\n        pageInfo {\n          hasNextPage\n          hasNextPage\n          startCursor\n          endCursor\n        }\n        edges {\n          node {\n            id\n            title\n            version\n          }\n        }\n      }\n    }\n  }\n": types.GetPostsListDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation createPost($input: CreatePostInput!) {\n    createPost(input: $input) {\n      clientMutationId\n    }\n  }\n"): (typeof documents)["\n  mutation createPost($input: CreatePostInput!) {\n    createPost(input: $input) {\n      clientMutationId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getPostsList {\n    viewer {\n      id\n      postList(first: 10) {\n        pageInfo {\n          hasNextPage\n          hasNextPage\n          startCursor\n          endCursor\n        }\n        edges {\n          node {\n            id\n            title\n            version\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query getPostsList {\n    viewer {\n      id\n      postList(first: 10) {\n        pageInfo {\n          hasNextPage\n          hasNextPage\n          startCursor\n          endCursor\n        }\n        edges {\n          node {\n            id\n            title\n            version\n          }\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;