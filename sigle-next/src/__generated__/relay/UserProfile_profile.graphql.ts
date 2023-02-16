/**
 * @generated SignedSource<<2f9d913ac78a75404af4975fd2d0c5c2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserProfile_profile$data = {
  readonly description: string | null;
  readonly displayName: string | null;
  readonly id: string;
  readonly twitterUsername: string | null;
  readonly websiteUrl: string | null;
  readonly " $fragmentType": "UserProfile_profile";
};
export type UserProfile_profile$key = {
  readonly " $data"?: UserProfile_profile$data;
  readonly " $fragmentSpreads": FragmentRefs<"UserProfile_profile">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserProfile_profile",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
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
  "type": "Profile",
  "abstractKey": null
};

(node as any).hash = "f4b5438cd3855e807eb07f468255a12e";

export default node;
