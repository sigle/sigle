import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
} from 'graphql';
import { globalIdField } from 'graphql-relay';
import { GraphqlContext } from '../types';
import { config } from '../config';
import { nodeField, nodeInterface } from './nodeInterface';

const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'User data',
  fields: () => ({
    id: globalIdField('User', user => user._id),
    _id: {
      type: GraphQLString,
      resolve: user => user._id,
      description: "The user's mongodb id",
    },
    username: {
      type: GraphQLString,
      resolve: user => user.username,
      description: "The user's public description",
    },
    name: {
      type: GraphQLString,
      resolve: user => user.name,
      description: "The user's public name",
    },
    description: {
      type: GraphQLString,
      resolve: user => user.description,
      description: "The user's public description",
    },
    imageUrl: {
      type: GraphQLString,
      args: {
        size: {
          type: GraphQLInt,
        },
      },
      // TODO resolve proxy size
      resolve: (user, args) => {
        let { size } = args;
        // Size default to 64
        if (!size) {
          size = 64;
        }
        const { username } = user;
        return user.imageUrl
          ? user.imageUrl
          : `https://ui-avatars.com/api/?color=ffffff&background=000000&size=${size}&name=${username}`;
      },
      description: 'A url pointing to the user image',
    },
  }),
  interfaces: () => [nodeInterface],
});

// TODO setup auto type generation
export const QueryType = new GraphQLObjectType<any, GraphqlContext>({
  name: 'Query',
  description: 'The root of all... queries',
  fields: () => ({
    node: nodeField,
    user: {
      type: UserType,
      args: {
        username: {
          type: GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (_, args, context) => {
        const { db } = context;
        const { username } = args;
        const radiksData = db.collection(config.radiksCollectionName);
        const user = await radiksData.findOne({
          radiksType: 'BlockstackUser',
          _id: username,
        });
        return user;
      },
    },
  }),
});
