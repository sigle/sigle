import { GraphQLClient } from 'graphql-request';
import { print } from 'graphql';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  Time: any;
  /** The `Long` scalar type represents non-fractional signed whole numeric values. Long can represent values between -(2^63) and 2^63 - 1. */
  Long: any;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Create a new document in the collection of 'Story' */
  createStory: Story;
  /** Update an existing document in the collection of 'Story' */
  updateStory?: Maybe<Story>;
  /** Delete an existing document in the collection of 'Story' */
  deleteStory?: Maybe<Story>;
};

export type MutationCreateStoryArgs = {
  data: StoryInput;
};

export type MutationUpdateStoryArgs = {
  id: Scalars['ID'];
  data: StoryInput;
};

export type MutationDeleteStoryArgs = {
  id: Scalars['ID'];
};

/** 'Story' input values */
export type StoryInput = {
  id: Scalars['ID'];
  username: Scalars['String'];
  title: Scalars['String'];
  coverImage?: Maybe<Scalars['String']>;
  metaTitle?: Maybe<Scalars['String']>;
  metaDescription?: Maybe<Scalars['String']>;
  featured?: Maybe<Scalars['Boolean']>;
  createdAt: Scalars['Time'];
  updatedAt: Scalars['Time'];
};

export type Query = {
  __typename?: 'Query';
  /** Find a document from the collection of 'Story' by its id. */
  findStoryByID?: Maybe<Story>;
  userStory?: Maybe<Story>;
};

export type QueryFindStoryByIdArgs = {
  id: Scalars['ID'];
};

export type QueryUserStoryArgs = {
  id: Scalars['ID'];
  username: Scalars['String'];
};

export type Story = {
  __typename?: 'Story';
  updatedAt: Scalars['Time'];
  metaDescription?: Maybe<Scalars['String']>;
  username: Scalars['String'];
  /** The document's ID. */
  _id: Scalars['ID'];
  featured?: Maybe<Scalars['Boolean']>;
  metaTitle?: Maybe<Scalars['String']>;
  coverImage?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  createdAt: Scalars['Time'];
  title: Scalars['String'];
  /** The document's timestamp. */
  _ts: Scalars['Long'];
};

export type CreateUserStoryMutationVariables = Exact<{
  data: StoryInput;
}>;

export type CreateUserStoryMutation = { __typename?: 'Mutation' } & {
  createStory: { __typename?: 'Story' } & Pick<Story, '_id'>;
};

export type FindUserStoryQueryVariables = Exact<{
  id: Scalars['ID'];
  username: Scalars['String'];
}>;

export type FindUserStoryQuery = { __typename?: 'Query' } & {
  userStory?: Maybe<
    { __typename?: 'Story' } & Pick<Story, '_id' | 'id' | 'username' | 'title'>
  >;
};

export type UpdateUserStoryMutationVariables = Exact<{
  id: Scalars['ID'];
  data: StoryInput;
}>;

export type UpdateUserStoryMutation = { __typename?: 'Mutation' } & {
  updateStory?: Maybe<{ __typename?: 'Story' } & Pick<Story, '_id'>>;
};

export const CreateUserStoryDocument = gql`
  mutation createUserStory($data: StoryInput!) {
    createStory(data: $data) {
      _id
    }
  }
`;
export const FindUserStoryDocument = gql`
  query findUserStory($id: ID!, $username: String!) {
    userStory(id: $id, username: $username) {
      _id
      id
      username
      title
    }
  }
`;
export const UpdateUserStoryDocument = gql`
  mutation updateUserStory($id: ID!, $data: StoryInput!) {
    updateStory(id: $id, data: $data) {
      _id
    }
  }
`;

export type SdkFunctionWrapper = <T>(action: () => Promise<T>) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (sdkFunction) => sdkFunction();
export function getSdk(
  client: GraphQLClient,
  withWrapper: SdkFunctionWrapper = defaultWrapper
) {
  return {
    createUserStory(
      variables: CreateUserStoryMutationVariables
    ): Promise<CreateUserStoryMutation> {
      return withWrapper(() =>
        client.request<CreateUserStoryMutation>(
          print(CreateUserStoryDocument),
          variables
        )
      );
    },
    findUserStory(
      variables: FindUserStoryQueryVariables
    ): Promise<FindUserStoryQuery> {
      return withWrapper(() =>
        client.request<FindUserStoryQuery>(
          print(FindUserStoryDocument),
          variables
        )
      );
    },
    updateUserStory(
      variables: UpdateUserStoryMutationVariables
    ): Promise<UpdateUserStoryMutation> {
      return withWrapper(() =>
        client.request<UpdateUserStoryMutation>(
          print(UpdateUserStoryDocument),
          variables
        )
      );
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;
