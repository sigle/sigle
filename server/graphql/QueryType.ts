import { GraphQLObjectType, GraphQLString, GraphQLNonNull } from 'graphql';
import { GraphqlContext } from '../types';
import { config } from '../config';
import { nodeField } from './nodeInterface';
import { UserType } from './UserType';

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
