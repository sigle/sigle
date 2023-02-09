/**
 * @generated SignedSource<<b0e15cf5e34b4a275a4d7a2e92d86c8c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
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
  title?: string | null;
};
export type UpdateOptionsInput = {
  replace?: boolean | null;
  version?: any | null;
};
export type EditorSaveUpdatePostMutation$variables = {
  input: UpdatePostInput;
};
export type EditorSaveUpdatePostMutation$data = {
  readonly updatePost: {
    readonly clientMutationId: string | null;
    readonly document: {
      readonly id: string;
      readonly title: string;
    };
  } | null;
};
export type EditorSaveUpdatePostMutation = {
  response: EditorSaveUpdatePostMutation$data;
  variables: EditorSaveUpdatePostMutation$variables;
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
            "name": "title",
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
    "name": "EditorSaveUpdatePostMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EditorSaveUpdatePostMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "74d5cb5158507df61a43ebb0548d1ff4",
    "id": null,
    "metadata": {},
    "name": "EditorSaveUpdatePostMutation",
    "operationKind": "mutation",
    "text": "mutation EditorSaveUpdatePostMutation(\n  $input: UpdatePostInput!\n) {\n  updatePost(input: $input) {\n    clientMutationId\n    document {\n      id\n      title\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "f100959ce4b04eef43938d5c5c68223e";

export default node;
