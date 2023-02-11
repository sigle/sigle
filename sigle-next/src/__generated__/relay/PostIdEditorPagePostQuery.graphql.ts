/**
 * @generated SignedSource<<11adca643a8b25ffd58132de88bd3285>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type PostIdEditorPagePostQuery$variables = {
  id: string;
};
export type PostIdEditorPagePostQuery$data = {
  readonly node: {
    readonly canonicalUrl?: string | null;
    readonly content?: string;
    readonly featuredImage?: string | null;
    readonly id?: string;
    readonly metaDescription?: string | null;
    readonly metaImage?: string | null;
    readonly metaTitle?: string | null;
    readonly title?: string;
  } | null;
};
export type PostIdEditorPagePostQuery = {
  response: PostIdEditorPagePostQuery$data;
  variables: PostIdEditorPagePostQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "content",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "featuredImage",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "metaTitle",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "metaDescription",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "metaImage",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "canonicalUrl",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "PostIdEditorPagePostQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/)
            ],
            "type": "Post",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PostIdEditorPagePostQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/)
            ],
            "type": "Post",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "d4be03c5af9adc31db0ab173cf7f3acf",
    "id": null,
    "metadata": {},
    "name": "PostIdEditorPagePostQuery",
    "operationKind": "query",
    "text": "query PostIdEditorPagePostQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on Post {\n      id\n      title\n      content\n      featuredImage\n      metaTitle\n      metaDescription\n      metaImage\n      canonicalUrl\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "84920254aae0ec06c1f3dafa46261a17";

export default node;
