/**
 * @generated SignedSource<<8b0eb25e4388d13ff6a17ff34fd1fe36>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type NavBarProfileQuery$variables = {};
export type NavBarProfileQuery$data = {
  readonly viewer: {
    readonly id: string;
    readonly " $fragmentSpreads": FragmentRefs<"UserDropdown_viewer">;
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
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "NavBarProfileQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "UserDropdown_viewer"
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
    "name": "NavBarProfileQuery",
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
    "cacheID": "dab0fb179abdd2b9a6853fd213af0d9b",
    "id": null,
    "metadata": {},
    "name": "NavBarProfileQuery",
    "operationKind": "query",
    "text": "query NavBarProfileQuery {\n  viewer {\n    id\n    ...UserDropdown_viewer\n  }\n}\n\nfragment UserDropdown_viewer on CeramicAccount {\n  id\n  profile {\n    id\n    displayName\n  }\n}\n"
  }
};
})();

(node as any).hash = "334fd752e911cfd41ccb04c6be067d56";

export default node;
