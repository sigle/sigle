/**
 * @generated SignedSource<<05bfa5a3787c7fa3e6dbb49e8b1c95f1>>
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
          readonly " $fragmentSpreads": FragmentRefs<"StoryCardPublished_post">;
        } | null;
      } | null> | null;
      readonly pageInfo: {
        readonly endCursor: string | null;
        readonly hasNextPage: boolean;
        readonly startCursor: string | null;
      };
    } | null;
    readonly profile: {
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"UserProfile_profile">;
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
            "args": null,
            "concreteType": "Profile",
            "kind": "LinkedField",
            "name": "profile",
            "plural": false,
            "selections": [
              (v0/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "UserProfile_profile"
              }
            ],
            "storageKey": null
          },
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
                        "name": "StoryCardPublished_post"
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
            "args": null,
            "concreteType": "Profile",
            "kind": "LinkedField",
            "name": "profile",
            "plural": false,
            "selections": [
              (v0/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "displayName",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "description",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "websiteUrl",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "twitterUsername",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
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
    "cacheID": "e03b06589570b5c6cf7bc8fc18b4d64a",
    "id": null,
    "metadata": {},
    "name": "profilePagePostsListQuery",
    "operationKind": "query",
    "text": "query profilePagePostsListQuery {\n  viewer {\n    id\n    profile {\n      id\n      ...UserProfile_profile\n    }\n    postList(first: 10) {\n      pageInfo {\n        hasNextPage\n        startCursor\n        endCursor\n      }\n      edges {\n        node {\n          id\n          ...StoryCardPublished_post\n        }\n      }\n    }\n  }\n}\n\nfragment StoryCardPublished_post on Post {\n  id\n  title\n}\n\nfragment UserProfile_profile on Profile {\n  id\n  displayName\n  description\n  websiteUrl\n  twitterUsername\n}\n"
  }
};
})();

(node as any).hash = "83ce5019366660a110cfe0d953901d76";

export default node;
