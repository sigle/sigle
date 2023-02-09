/**
 * @generated SignedSource<<893302441ec7ec5880475b7485c27498>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type profilePagePostsListQuery$variables = {};
export type profilePagePostsListQuery$data = {
  readonly viewer: {
    readonly id: string;
    readonly postList: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly id: string;
          readonly " $fragmentSpreads": FragmentRefs<"StoryCardDraft_post">;
        } | null;
      } | null> | null;
      readonly pageInfo: {
        readonly endCursor: string | null;
        readonly hasNextPage: boolean;
        readonly startCursor: string | null;
      };
    } | null;
  } | null;
};
export type profilePagePostsListQuery = {
  response: profilePagePostsListQuery$data;
  variables: profilePagePostsListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
  }
],
v2 = {
  "alias": null,
  "args": null,
  "concreteType": "PageInfo",
  "kind": "LinkedField",
  "name": "pageInfo",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "hasNextPage",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "startCursor",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "endCursor",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "profilePagePostsListQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "CeramicAccount",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "PostConnection",
            "kind": "LinkedField",
            "name": "postList",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "PostEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Post",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v0/*: any*/),
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "StoryCardDraft_post"
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "postList(first:10)"
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "profilePagePostsListQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "CeramicAccount",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "PostConnection",
            "kind": "LinkedField",
            "name": "postList",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "PostEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Post",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v0/*: any*/),
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
            ],
            "storageKey": "postList(first:10)"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "7584c16b326f9ee81d0f4cb42e426e98",
    "id": null,
    "metadata": {},
    "name": "profilePagePostsListQuery",
    "operationKind": "query",
    "text": "query profilePagePostsListQuery {\n  viewer {\n    id\n    postList(first: 10) {\n      pageInfo {\n        hasNextPage\n        startCursor\n        endCursor\n      }\n      edges {\n        node {\n          id\n          ...StoryCardDraft_post\n        }\n      }\n    }\n  }\n}\n\nfragment StoryCardDraft_post on Post {\n  id\n  title\n}\n"
  }
};
})();

(node as any).hash = "c071217dfa650f69285ec3bb51436d40";

export default node;
