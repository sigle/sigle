/**
 * @generated SignedSource<<747865b2388d297797522e7efdfa1596>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type CreateProfileInput = {
  clientMutationId?: string | null;
  content: ProfileInput;
};
export type ProfileInput = {
  description: string;
  displayName: string;
  twitterUsername?: string | null;
  websiteUrl?: string | null;
};
export type settingsCreateProfileMutation$variables = {
  input: CreateProfileInput;
};
export type settingsCreateProfileMutation$data = {
  readonly createProfile: {
    readonly clientMutationId: string | null;
    readonly document: {
      readonly description: string;
      readonly id: string;
      readonly twitterUsername: string | null;
      readonly websiteUrl: string | null;
    };
  } | null;
};
export type settingsCreateProfileMutation = {
  response: settingsCreateProfileMutation$data;
  variables: settingsCreateProfileMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "CreateProfilePayload",
    "kind": "LinkedField",
    "name": "createProfile",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "clientMutationId",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Profile",
        "kind": "LinkedField",
        "name": "document",
        "plural": false,
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
            "name": "websiteUrl",
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
            "name": "twitterUsername",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "settingsCreateProfileMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "settingsCreateProfileMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "92b0e0d161765c77584dd3d3ee1298e2",
    "id": null,
    "metadata": {},
    "name": "settingsCreateProfileMutation",
    "operationKind": "mutation",
    "text": "mutation settingsCreateProfileMutation(\n  $input: CreateProfileInput!\n) {\n  createProfile(input: $input) {\n    clientMutationId\n    document {\n      id\n      websiteUrl\n      description\n      twitterUsername\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3e3cc425cb8dbc6812824d661d282ff0";

export default node;
