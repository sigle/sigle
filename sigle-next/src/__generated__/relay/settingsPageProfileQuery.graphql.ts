/**
 * @generated SignedSource<<16cd2f7d32630719dcb63c6cf8e40b22>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type settingsPageProfileQuery$variables = {};
export type settingsPageProfileQuery$data = {
  readonly viewer: {
    readonly id: string;
    readonly profile: {
      readonly description: string | null;
      readonly displayName: string | null;
      readonly id: string;
      readonly twitterUsername: string | null;
      readonly websiteUrl: string | null;
    } | null;
  } | null;
};
export type settingsPageProfileQuery = {
  response: settingsPageProfileQuery$data;
  variables: settingsPageProfileQuery$variables;
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
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "settingsPageProfileQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "settingsPageProfileQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "85360af33cd8b325017a90845ab4fbce",
    "id": null,
    "metadata": {},
    "name": "settingsPageProfileQuery",
    "operationKind": "query",
    "text": "query settingsPageProfileQuery {\n  viewer {\n    id\n    profile {\n      id\n      displayName\n      description\n      websiteUrl\n      twitterUsername\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "708a642632449f4141faf1610e333e49";

export default node;
