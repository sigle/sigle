/**
 * @generated SignedSource<<bb87e931bf0d15fac6eef5b08e49490e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserDropdown_viewer$data = {
  readonly id: string;
  readonly profile: {
    readonly displayName: string | null;
    readonly id: string;
  } | null;
  readonly " $fragmentType": "UserDropdown_viewer";
};
export type UserDropdown_viewer$key = {
  readonly " $data"?: UserDropdown_viewer$data;
  readonly " $fragmentSpreads": FragmentRefs<"UserDropdown_viewer">;
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
  "name": "UserDropdown_viewer",
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
  "type": "CeramicAccount",
  "abstractKey": null
};
})();

(node as any).hash = "c9887d57cc83135df55feaaebe0928c6";

export default node;
