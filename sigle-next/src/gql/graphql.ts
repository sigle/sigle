/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A Ceramic Commit ID */
  CeramicCommitID: any;
};

export type CeramicAccount = Node & {
  __typename?: 'CeramicAccount';
  /** Globally unique identifier of the account (DID string) */
  id: Scalars['ID'];
  /** Whether the Ceramic instance is currently authenticated with this account or not */
  isViewer: Scalars['Boolean'];
  postList?: Maybe<PostConnection>;
};

export type CeramicAccountPostListArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type CreatePostInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
  content: PostInput;
};

export type CreatePostPayload = {
  __typename?: 'CreatePostPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  document: Post;
  /** Fetches an object given its ID */
  node?: Maybe<Node>;
  /** Account currently authenticated on the Ceramic instance, if set */
  viewer?: Maybe<CeramicAccount>;
};

export type CreatePostPayloadNodeArgs = {
  id: Scalars['ID'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createPost?: Maybe<CreatePostPayload>;
  updatePost?: Maybe<UpdatePostPayload>;
};

export type MutationCreatePostArgs = {
  input: CreatePostInput;
};

export type MutationUpdatePostArgs = {
  input: UpdatePostInput;
};

/** An object with an ID */
export type Node = {
  /** The id of the object. */
  id: Scalars['ID'];
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
};

export type PartialPostInput = {
  title?: InputMaybe<Scalars['String']>;
};

export type Post = Node & {
  __typename?: 'Post';
  /** Account controlling the document */
  author: CeramicAccount;
  id: Scalars['ID'];
  title: Scalars['String'];
  /** Current version of the document */
  version: Scalars['CeramicCommitID'];
};

/** A connection to a list of items. */
export type PostConnection = {
  __typename?: 'PostConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<PostEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type PostEdge = {
  __typename?: 'PostEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Post>;
};

export type PostInput = {
  title: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  /** Fetches an object given its ID */
  node?: Maybe<Node>;
  postIndex?: Maybe<PostConnection>;
  /** Account currently authenticated on the Ceramic instance, if set */
  viewer?: Maybe<CeramicAccount>;
};

export type QueryNodeArgs = {
  id: Scalars['ID'];
};

export type QueryPostIndexArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type UpdateOptionsInput = {
  /** Fully replace the document contents instead of performing a shallow merge */
  replace?: InputMaybe<Scalars['Boolean']>;
  /** Only perform mutation if the document matches the provided version */
  version?: InputMaybe<Scalars['CeramicCommitID']>;
};

export type UpdatePostInput = {
  clientMutationId?: InputMaybe<Scalars['String']>;
  content: PartialPostInput;
  id: Scalars['ID'];
  options?: InputMaybe<UpdateOptionsInput>;
};

export type UpdatePostPayload = {
  __typename?: 'UpdatePostPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  document: Post;
  /** Fetches an object given its ID */
  node?: Maybe<Node>;
  /** Account currently authenticated on the Ceramic instance, if set */
  viewer?: Maybe<CeramicAccount>;
};

export type UpdatePostPayloadNodeArgs = {
  id: Scalars['ID'];
};

export type CreatePostMutationVariables = Exact<{ [key: string]: never }>;

export type CreatePostMutation = {
  __typename?: 'Mutation';
  createPost?: {
    __typename?: 'CreatePostPayload';
    clientMutationId?: string | null;
  } | null;
};

export const CreatePostDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'createPost' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createPost' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'content' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'title' },
                            value: {
                              kind: 'StringValue',
                              value: 'TEst',
                              block: false,
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'clientMutationId' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreatePostMutation, CreatePostMutationVariables>;
