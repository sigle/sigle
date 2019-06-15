import { GraphQLObjectType, GraphQLString, GraphQLNonNull } from 'graphql';
import { globalIdField, fromGlobalId } from 'graphql-relay';
import { Db } from 'mongodb';
// @ts-ignore
import { COLLECTION } from 'radiks-server/app/lib/constants';

// TODO description of the fields
const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'User data',
  fields: () => ({
    id: globalIdField('User'),
    _id: {
      type: GraphQLString,
      resolve: user => user._id,
    },
    username: {
      type: GraphQLString,
      resolve: user => user.username,
    },
    name: {
      type: GraphQLString,
      resolve: user => user.name,
    },
    description: {
      type: GraphQLString,
      resolve: user => user.description,
    },
  }),
});

// TODO setup auto type generation
export const QueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'The root of all... queries',
  fields: () => ({
    // TODO relay global node query
    user: {
      type: UserType,
      args: {
        username: {
          type: GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (_, args, context) => {
        const { db }: { db: Db } = context;
        const { username } = args;
        const radiksData = db.collection(COLLECTION);
        const user = await radiksData.findOne({
          radiksType: 'BlockstackUser',
          _id: username,
        });
        return user;
      },
    },
  }),
});
