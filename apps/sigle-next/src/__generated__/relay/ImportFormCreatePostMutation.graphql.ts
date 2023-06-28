/**
 * @generated SignedSource<<fdb7f78874ad3871aabdb4e58f251457>>
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
export type ImportFormCreatePostMutation$variables = {
  input: CreatePostInput;
};
export type ImportFormCreatePostMutation$data = {
  readonly createPost: {
    readonly clientMutationId: string | null;
    readonly document: {
      readonly id: string;
    };
  } | null;
};
export type ImportFormCreatePostMutation = {
  response: ImportFormCreatePostMutation$data;
  variables: ImportFormCreatePostMutation$variables;
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
    "name": "ImportFormCreatePostMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ImportFormCreatePostMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "d13bc1dcd8b4a823cd3f5439a8cb2585",
    "id": null,
    "metadata": {},
    "name": "ImportFormCreatePostMutation",
    "operationKind": "mutation",
    "text": "mutation ImportFormCreatePostMutation(\n  $input: CreatePostInput!\n) {\n  createPost(input: $input) {\n    clientMutationId\n    document {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d4bf1f8774f4d68f3ddd1b3049e9d2cb";

export default node;
