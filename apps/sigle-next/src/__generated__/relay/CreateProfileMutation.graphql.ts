/**
 * @generated SignedSource<<0ac3c86987ed389aa928b69a81b8f672>>
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
  websiteUrl?: any | null;
};
export type CreateProfileMutation$variables = {
  input: CreateProfileInput;
};
export type CreateProfileMutation$data = {
  readonly createProfile: {
    readonly clientMutationId: string | null;
    readonly document: {
      readonly description: string | null;
      readonly displayName: string | null;
      readonly id: string;
      readonly twitterUsername: string | null;
      readonly websiteUrl: any | null;
    };
  } | null;
};
export type CreateProfileMutation = {
  response: CreateProfileMutation$data;
  variables: CreateProfileMutation$variables;
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
    "name": "CreateProfileMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "CreateProfileMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "4a2d59596020f4b386b257c353581922",
    "id": null,
    "metadata": {},
    "name": "CreateProfileMutation",
    "operationKind": "mutation",
    "text": "mutation CreateProfileMutation(\n  $input: CreateProfileInput!\n) {\n  createProfile(input: $input) {\n    clientMutationId\n    document {\n      id\n      displayName\n      websiteUrl\n      description\n      twitterUsername\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "80dbb5fca89e50c851f93f28eee5fa4c";

export default node;
