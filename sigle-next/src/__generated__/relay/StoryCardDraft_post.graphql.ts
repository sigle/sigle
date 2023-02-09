/**
 * @generated SignedSource<<ef90039cfed5bf05a77186b639a24184>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StoryCardDraft_post$data = {
  readonly id: string;
  readonly title: string;
  readonly " $fragmentType": "StoryCardDraft_post";
};
export type StoryCardDraft_post$key = {
  readonly " $data"?: StoryCardDraft_post$data;
  readonly " $fragmentSpreads": FragmentRefs<"StoryCardDraft_post">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "StoryCardDraft_post",
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

(node as any).hash = "12220fa059f3b2e3d41f0ecc7dacde18";

export default node;
