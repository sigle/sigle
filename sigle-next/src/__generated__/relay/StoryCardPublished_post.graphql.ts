/**
 * @generated SignedSource<<f99044524a5f6826a3deeef6e56067f6>>
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
    readonly isViewer: boolean;
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
      "storageKey": null
    }
  ],
  "type": "Post",
  "abstractKey": null
};
})();

(node as any).hash = "0b6c0c0beb300768751f309c279f21ee";

export default node;
