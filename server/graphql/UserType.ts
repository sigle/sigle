import { GraphQLObjectType, GraphQLString, GraphQLInt } from 'graphql';
import { globalIdField } from 'graphql-relay';
import { nodeInterface } from './nodeInterface';

export const UserType = new GraphQLObjectType({
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
      // TODO auto generated types
      resolve: (user, args) => {
        // TODO resolve proxy size
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
