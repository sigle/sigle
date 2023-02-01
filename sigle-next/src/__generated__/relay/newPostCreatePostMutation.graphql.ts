/**
 * @generated SignedSource<<bba522e2b1beb1170bea6f992eec6108>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type CreatePostInput = {
  clientMutationId?: string | null;
  content: PostInput;
};
export type PostInput = {
  canonicalUrl?: string | null;
  content: string;
  featuredImage?: string | null;
  metaDescription?: string | null;
  metaImage?: string | null;
  metaTitle?: string | null;
  title: string;
};
export type newPostCreatePostMutation$variables = {
  input: CreatePostInput;
};
export type newPostCreatePostMutation$data = {
  readonly createPost: {
    readonly clientMutationId: string | null;
  } | null;
};
export type newPostCreatePostMutation = {
  response: newPostCreatePostMutation$data;
  variables: newPostCreatePostMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "CreatePostPayload",
    "kind": "LinkedField",
    "name": "createPost",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "clientMutationId",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "newPostCreatePostMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "newPostCreatePostMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "2a8f1e6ab0cf2635894ed3fe9070c16b",
    "id": null,
    "metadata": {},
    "name": "newPostCreatePostMutation",
    "operationKind": "mutation",
    "text": "mutation newPostCreatePostMutation(\n  $input: CreatePostInput!\n) {\n  createPost(input: $input) {\n    clientMutationId\n  }\n}\n"
  }
};
})();

(node as any).hash = "17e16678c290079bd14023247528637d";

export default node;
