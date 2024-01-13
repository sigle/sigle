/**
 * @generated SignedSource<<6abde16fb5cd3bf1515e5e2b6500f5db>>
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
  websiteUrl?: any | null;
};
export type UpdateOptionsInput = {
  replace?: boolean | null;
  version?: any | null;
};
export type UpdateProfileMutation$variables = {
  input: UpdateProfileInput;
};
export type UpdateProfileMutation$data = {
  readonly updateProfile: {
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
export type UpdateProfileMutation = {
  response: UpdateProfileMutation$data;
  variables: UpdateProfileMutation$variables;
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
    "name": "UpdateProfileMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UpdateProfileMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "b3b2c2c9d91457e59455067175cdd95b",
    "id": null,
    "metadata": {},
    "name": "UpdateProfileMutation",
    "operationKind": "mutation",
    "text": "mutation UpdateProfileMutation(\n  $input: UpdateProfileInput!\n) {\n  updateProfile(input: $input) {\n    clientMutationId\n    document {\n      id\n      displayName\n      websiteUrl\n      description\n      twitterUsername\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "9cbbf0ff8c843a6633eba7120a2d7f5f";

export default node;
