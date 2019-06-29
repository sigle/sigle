import { GraphQLObjectType, GraphQLString, GraphQLNonNull } from 'graphql';
import { mrType, mrArgs, mrResolve } from 'mongo-relay-connection';
import { GraphqlContext } from '../types';
import { config } from '../config';
import { nodeField } from './nodeInterface';
import { UserType } from './UserType';
import { PublicStoryType } from './PublicStoryType';
import { PublicStoryModel } from '../models';

// TODO setup auto type generation
export const QueryType = new GraphQLObjectType<{}, GraphqlContext>({
  name: 'Query',
  description: 'The root of all... queries',
  fields: () => ({
    node: nodeField,

    user: {
      description: "Fetches and user given it's username",
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

    publicStories: {
      description: 'Fetches the list of current public stories',
      type: mrType('PublicStory', PublicStoryType),
      args: mrArgs,
      resolve: (_, args) => {
        const query = {
          radiksType: 'PublicStory',
        };
        const opts = {
          cursorField: 'createdAt',
          direction: -1,
        };
        return mrResolve(args, PublicStoryModel, query, opts);
      },
    },
  }),
});
