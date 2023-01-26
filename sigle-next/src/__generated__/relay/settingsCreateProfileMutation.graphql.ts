/**
 * @generated SignedSource<<ff4173527c19e3dca4fd465faf27f396>>
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
  description?: string | null;
  displayName?: string | null;
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
      readonly description: string | null;
      readonly displayName: string | null;
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
            "name": "displayName",
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
    "cacheID": "0a837be6db538332449230521c274a64",
    "id": null,
    "metadata": {},
    "name": "settingsCreateProfileMutation",
    "operationKind": "mutation",
    "text": "mutation settingsCreateProfileMutation(\n  $input: CreateProfileInput!\n) {\n  createProfile(input: $input) {\n    clientMutationId\n    document {\n      id\n      displayName\n      websiteUrl\n      description\n      twitterUsername\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "7927f0e62b595320ad3f529980737aa3";

export default node;
