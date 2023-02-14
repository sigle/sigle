/**
 * @generated SignedSource<<247a54ed4eabed9ddbbb1e4b01315cc1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StoryCardPublished_post$data = {
  readonly author: {
    readonly id: string;
    readonly profile: {
      readonly displayName: string | null;
      readonly id: string;
    } | null;
  };
  readonly id: string;
  readonly title: string;
  readonly " $fragmentType": "StoryCardPublished_post";
};
export type StoryCardPublished_post$key = {
  readonly " $data"?: StoryCardPublished_post$data;
  readonly " $fragmentSpreads": FragmentRefs<"StoryCardPublished_post">;
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
  "name": "StoryCardPublished_post",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "title",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "CeramicAccount",
      "kind": "LinkedField",
      "name": "author",
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
  ],
  "type": "Post",
  "abstractKey": null
};
})();

(node as any).hash = "477b59c1c4ba09fd6f9b6a579ec5b261";

export default node;
