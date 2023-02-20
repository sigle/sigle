/**
 * @generated SignedSource<<9810dc05cb882354343a08b8f1b54af5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserProfilePageHeader_user$data = {
  readonly id: string;
  readonly isViewer: boolean;
  readonly profile: {
    readonly displayName: string | null;
    readonly id: string;
  } | null;
  readonly " $fragmentType": "UserProfilePageHeader_user";
};
export type UserProfilePageHeader_user$key = {
  readonly " $data"?: UserProfilePageHeader_user$data;
  readonly " $fragmentSpreads": FragmentRefs<"UserProfilePageHeader_user">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserProfilePageHeader_user",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isViewer",
      "storageKey": null
    },
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
  "type": "CeramicAccount",
  "abstractKey": null
};
})();

(node as any).hash = "734631a3ad94892cf66dbc75a3d4f468";

export default node;
