/**
 * @generated SignedSource<<4ba006f09300f67ef37e83a47eda75d3>>
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
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "4427949845e65e019fa7b6f2896626c7",
    "id": null,
    "metadata": {},
    "name": "profilePagePostsListQuery",
    "operationKind": "query",
    "text": "query profilePagePostsListQuery {\n  viewer {\n    id\n    profile {\n      id\n      ...UserProfile_profile\n    }\n  }\n}\n\nfragment UserProfile_profile on Profile {\n  id\n  displayName\n  description\n  websiteUrl\n  twitterUsername\n}\n"
  }
};
})();

(node as any).hash = "d4edc23a60fe24754b7b5b87d12d0502";

export default node;
