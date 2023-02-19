/**
 * @generated SignedSource<<fd99e9d90421d8bf8d7ec63ea7f8b6fa>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type NavBarProfileQuery$variables = {};
export type NavBarProfileQuery$data = {
  readonly viewer: {
    readonly id: string;
    readonly profile: {
      readonly id: string;
    } | null;
  } | null;
};
export type NavBarProfileQuery = {
  response: NavBarProfileQuery$data;
  variables: NavBarProfileQuery$variables;
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
          (v0/*: any*/)
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
    "name": "NavBarProfileQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "NavBarProfileQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "1ac3e38761d7f6f8185da854bc0f0c1d",
    "id": null,
    "metadata": {},
    "name": "NavBarProfileQuery",
    "operationKind": "query",
    "text": "query NavBarProfileQuery {\n  viewer {\n    id\n    profile {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "185c6e369a1871fb1288a46e06effd22";

export default node;
