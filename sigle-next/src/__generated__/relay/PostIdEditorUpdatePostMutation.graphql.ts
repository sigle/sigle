/**
 * @generated SignedSource<<3a20e684e42bbdc18c8644d7417c46be>>
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
export type PostIdEditorUpdatePostMutation$variables = {
  input: UpdatePostInput;
};
export type PostIdEditorUpdatePostMutation$data = {
  readonly updatePost: {
    readonly clientMutationId: string | null;
    readonly document: {
      readonly id: string;
    };
  } | null;
};
export type PostIdEditorUpdatePostMutation = {
  response: PostIdEditorUpdatePostMutation$data;
  variables: PostIdEditorUpdatePostMutation$variables;
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
    "name": "PostIdEditorUpdatePostMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PostIdEditorUpdatePostMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f767333f1305568fb9d3e52ff63e7b43",
    "id": null,
    "metadata": {},
    "name": "PostIdEditorUpdatePostMutation",
    "operationKind": "mutation",
    "text": "mutation PostIdEditorUpdatePostMutation(\n  $input: UpdatePostInput!\n) {\n  updatePost(input: $input) {\n    clientMutationId\n    document {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a71d3b1415b89107782b2aa138e862e3";

export default node;
