/**
 * @generated SignedSource<<ae5fa4531fede8469d2ef93e45734539>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type PostStatus = "DELETED" | "DRAFT" | "PUBLISHED" | "%future added value";
export type CreatePostInput = {
  clientMutationId?: string | null;
  content: PostInput;
};
export type PostInput = {
  canonicalUrl?: any | null;
  content: string;
  featuredImage?: string | null;
  metaDescription?: string | null;
  metaImage?: string | null;
  metaTitle?: string | null;
  status?: PostStatus | null;
  title: string;
};
export type newPostCreatePostMutation$variables = {
  input: CreatePostInput;
};
export type newPostCreatePostMutation$data = {
  readonly createPost: {
    readonly clientMutationId: string | null;
    readonly document: {
      readonly id: string;
    };
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
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Post",
        "kind": "LinkedField",
        "name": "document",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
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
    "cacheID": "655177b7130295156428c1b625fbeaaa",
    "id": null,
    "metadata": {},
    "name": "newPostCreatePostMutation",
    "operationKind": "mutation",
    "text": "mutation newPostCreatePostMutation(\n  $input: CreatePostInput!\n) {\n  createPost(input: $input) {\n    clientMutationId\n    document {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "808d3cf65223ea4cdfe83ed0ddcc1d2c";

export default node;
