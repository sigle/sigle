/**
 * @generated SignedSource<<ab214581531d1ce63217ee4b2d73fc3e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type draftsPostsListQuery$variables = {};
export type draftsPostsListQuery$data = {
  readonly viewer: {
    readonly id: string;
    readonly postList: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly id: string;
          readonly title: string;
          readonly version: any;
        } | null;
      } | null> | null;
      readonly pageInfo: {
        readonly endCursor: string | null;
        readonly hasNextPage: boolean;
        readonly startCursor: string | null;
      };
    } | null;
  } | null;
};
export type draftsPostsListQuery = {
  response: draftsPostsListQuery$data;
  variables: draftsPostsListQuery$variables;
};

const node: ConcreteRequest = (function () {
  var v0 = {
      alias: null,
      args: null,
      kind: 'ScalarField',
      name: 'id',
      storageKey: null,
    },
    v1 = [
      {
        alias: null,
        args: null,
        concreteType: 'CeramicAccount',
        kind: 'LinkedField',
        name: 'viewer',
        plural: false,
        selections: [
          v0 /*: any*/,
          {
            alias: null,
            args: [
              {
                kind: 'Literal',
                name: 'first',
                value: 10,
              },
            ],
            concreteType: 'PostConnection',
            kind: 'LinkedField',
            name: 'postList',
            plural: false,
            selections: [
              {
                alias: null,
                args: null,
                concreteType: 'PageInfo',
                kind: 'LinkedField',
                name: 'pageInfo',
                plural: false,
                selections: [
                  {
                    alias: null,
                    args: null,
                    kind: 'ScalarField',
                    name: 'hasNextPage',
                    storageKey: null,
                  },
                  {
                    alias: null,
                    args: null,
                    kind: 'ScalarField',
                    name: 'startCursor',
                    storageKey: null,
                  },
                  {
                    alias: null,
                    args: null,
                    kind: 'ScalarField',
                    name: 'endCursor',
                    storageKey: null,
                  },
                ],
                storageKey: null,
              },
              {
                alias: null,
                args: null,
                concreteType: 'PostEdge',
                kind: 'LinkedField',
                name: 'edges',
                plural: true,
                selections: [
                  {
                    alias: null,
                    args: null,
                    concreteType: 'Post',
                    kind: 'LinkedField',
                    name: 'node',
                    plural: false,
                    selections: [
                      v0 /*: any*/,
                      {
                        alias: null,
                        args: null,
                        kind: 'ScalarField',
                        name: 'title',
                        storageKey: null,
                      },
                      {
                        alias: null,
                        args: null,
                        kind: 'ScalarField',
                        name: 'version',
                        storageKey: null,
                      },
                    ],
                    storageKey: null,
                  },
                ],
                storageKey: null,
              },
            ],
            storageKey: 'postList(first:10)',
          },
        ],
        storageKey: null,
      },
    ];
  return {
    fragment: {
      argumentDefinitions: [],
      kind: 'Fragment',
      metadata: null,
      name: 'draftsPostsListQuery',
      selections: v1 /*: any*/,
      type: 'Query',
      abstractKey: null,
    },
    kind: 'Request',
    operation: {
      argumentDefinitions: [],
      kind: 'Operation',
      name: 'draftsPostsListQuery',
      selections: v1 /*: any*/,
    },
    params: {
      cacheID: '3fbe17e2ded7ed32db5e429d954c9205',
      id: null,
      metadata: {},
      name: 'draftsPostsListQuery',
      operationKind: 'query',
      text: 'query draftsPostsListQuery {\n  viewer {\n    id\n    postList(first: 10) {\n      pageInfo {\n        hasNextPage\n        startCursor\n        endCursor\n      }\n      edges {\n        node {\n          id\n          title\n          version\n        }\n      }\n    }\n  }\n}\n',
    },
  };
})();

(node as any).hash = '078c7a8c2aa7735290780d5326885a40';

export default node;
