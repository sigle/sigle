/**
 * @generated SignedSource<<c7a0e323b9cc2b6295f3c3c87817746e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StoryCardPublished_post$data = {
  readonly id: string;
  readonly title: string;
  readonly " $fragmentType": "StoryCardPublished_post";
};
export type StoryCardPublished_post$key = {
  readonly " $data"?: StoryCardPublished_post$data;
  readonly " $fragmentSpreads": FragmentRefs<"StoryCardPublished_post">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "StoryCardPublished_post",
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
      "name": "title",
      "storageKey": null
    }
  ],
  "type": "Post",
  "abstractKey": null
};

(node as any).hash = "e65e14cf63d75f337c03b3dc04df8dd2";

export default node;
