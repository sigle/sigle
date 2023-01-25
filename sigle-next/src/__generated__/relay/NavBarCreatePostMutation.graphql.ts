/**
 * @generated SignedSource<<2dd61939175d8155f3bc1157b37a477d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type CreatePostInput = {
  clientMutationId?: string | null;
  content: PostInput;
};
export type PostInput = {
  title: string;
};
export type NavBarCreatePostMutation$variables = {
  input: CreatePostInput;
};
export type NavBarCreatePostMutation$data = {
  readonly createPost: {
    readonly clientMutationId: string | null;
  } | null;
};
export type NavBarCreatePostMutation = {
  response: NavBarCreatePostMutation$data;
  variables: NavBarCreatePostMutation$variables;
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
    "concreteType": "CreatePostPayload",
    "kind": "LinkedField",
    "name": "createPost",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "clientMutationId",
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
    "name": "NavBarCreatePostMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "NavBarCreatePostMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "1ad2eeea527b98950943c34211d1936d",
    "id": null,
    "metadata": {},
    "name": "NavBarCreatePostMutation",
    "operationKind": "mutation",
    "text": "mutation NavBarCreatePostMutation(\n  $input: CreatePostInput!\n) {\n  createPost(input: $input) {\n    clientMutationId\n  }\n}\n"
  }
};
})();

(node as any).hash = "73ffb951346d3bcd09bd5d11079b2105";

export default node;
