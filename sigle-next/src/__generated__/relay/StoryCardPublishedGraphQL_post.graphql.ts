/**
 * @generated SignedSource<<42be5a5652284530be19ef93d67b2783>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StoryCardPublishedGraphQL_post$data = {
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
  readonly " $fragmentType": "StoryCardPublishedGraphQL_post";
};
export type StoryCardPublishedGraphQL_post$key = {
  readonly " $data"?: StoryCardPublishedGraphQL_post$data;
  readonly " $fragmentSpreads": FragmentRefs<"StoryCardPublishedGraphQL_post">;
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
  "name": "StoryCardPublishedGraphQL_post",
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

(node as any).hash = "68e7133909c3d177ffc6ddd3d3a221d7";

export default node;
