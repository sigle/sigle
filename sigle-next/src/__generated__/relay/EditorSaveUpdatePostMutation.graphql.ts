/**
 * @generated SignedSource<<f7974a37ed4e2027da1a0e410edf395d>>
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
      readonly canonicalUrl: string | null;
      readonly featuredImage: string | null;
      readonly id: string;
      readonly metaDescription: string | null;
      readonly metaImage: string | null;
      readonly metaTitle: string | null;
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "featuredImage",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "metaTitle",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "metaDescription",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "metaImage",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "canonicalUrl",
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
    "cacheID": "52eb51fcaafa2b719cf0b1645965370f",
    "id": null,
    "metadata": {},
    "name": "EditorSaveUpdatePostMutation",
    "operationKind": "mutation",
    "text": "mutation EditorSaveUpdatePostMutation(\n  $input: UpdatePostInput!\n) {\n  updatePost(input: $input) {\n    clientMutationId\n    document {\n      id\n      title\n      featuredImage\n      metaTitle\n      metaDescription\n      metaImage\n      canonicalUrl\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b996942242f5bee3fbf59786b1ade2d4";

export default node;
