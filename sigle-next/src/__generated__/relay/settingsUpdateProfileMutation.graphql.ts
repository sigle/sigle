/**
 * @generated SignedSource<<977ea739853cdb060bd41ea67efecf82>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type UpdateProfileInput = {
  clientMutationId?: string | null;
  content: PartialProfileInput;
  id: string;
  options?: UpdateOptionsInput | null;
};
export type PartialProfileInput = {
  description?: string | null;
  displayName?: string | null;
  twitterUsername?: string | null;
  websiteUrl?: string | null;
};
export type UpdateOptionsInput = {
  replace?: boolean | null;
  version?: any | null;
};
export type settingsUpdateProfileMutation$variables = {
  input: UpdateProfileInput;
};
export type settingsUpdateProfileMutation$data = {
  readonly updateProfile: {
    readonly clientMutationId: string | null;
    readonly document: {
      readonly description: string;
      readonly displayName: string;
      readonly id: string;
      readonly twitterUsername: string | null;
      readonly websiteUrl: string | null;
    };
  } | null;
};
export type settingsUpdateProfileMutation = {
  response: settingsUpdateProfileMutation$data;
  variables: settingsUpdateProfileMutation$variables;
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
    "concreteType": "UpdateProfilePayload",
    "kind": "LinkedField",
    "name": "updateProfile",
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
    "name": "settingsUpdateProfileMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "settingsUpdateProfileMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "2bd72f8261dfd92cac52b9a3dc70c8bf",
    "id": null,
    "metadata": {},
    "name": "settingsUpdateProfileMutation",
    "operationKind": "mutation",
    "text": "mutation settingsUpdateProfileMutation(\n  $input: UpdateProfileInput!\n) {\n  updateProfile(input: $input) {\n    clientMutationId\n    document {\n      id\n      displayName\n      websiteUrl\n      description\n      twitterUsername\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "f09d8d6f97ff200e8b54a64552149038";

export default node;
