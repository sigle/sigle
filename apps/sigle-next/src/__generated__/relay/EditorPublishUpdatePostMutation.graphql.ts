/**
 * @generated SignedSource<<d527e7fa8389c3dfbfb8043bc93bfd71>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type PostStatus = "DELETED" | "DRAFT" | "PUBLISHED" | "%future added value";
export type UpdatePostInput = {
  clientMutationId?: string | null;
  content: PartialPostInput;
  id: string;
  options?: UpdateOptionsInput | null;
};
export type PartialPostInput = {
  canonicalUrl?: string | null;
  content?: string | null;
  featuredImage?: string | null;
  metaDescription?: string | null;
  metaImage?: string | null;
  metaTitle?: string | null;
  status?: PostStatus | null;
  title?: string | null;
};
export type UpdateOptionsInput = {
  replace?: boolean | null;
  version?: any | null;
};
export type EditorPublishUpdatePostMutation$variables = {
  input: UpdatePostInput;
};
export type EditorPublishUpdatePostMutation$data = {
  readonly updatePost: {
    readonly clientMutationId: string | null;
    readonly document: {
      readonly id: string;
      readonly status: PostStatus | null;
    };
  } | null;
};
export type EditorPublishUpdatePostMutation = {
  response: EditorPublishUpdatePostMutation$data;
  variables: EditorPublishUpdatePostMutation$variables;
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
    "concreteType": "UpdatePostPayload",
    "kind": "LinkedField",
    "name": "updatePost",
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "status",
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
    "name": "EditorPublishUpdatePostMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EditorPublishUpdatePostMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "2a20d879ad55c4bd8e0df6b7380b963c",
    "id": null,
    "metadata": {},
    "name": "EditorPublishUpdatePostMutation",
    "operationKind": "mutation",
    "text": "mutation EditorPublishUpdatePostMutation(\n  $input: UpdatePostInput!\n) {\n  updatePost(input: $input) {\n    clientMutationId\n    document {\n      id\n      status\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3737063409e362620bea8a6b46db1a06";

export default node;
