import { fromGlobalId, nodeDefinitions } from 'graphql-relay';
import { GraphqlContext } from '../types';
import { config } from '../config';

const mapGraphqlTypeToMongoCollection: { [key: string]: string } = {
  User: 'BlockstackUser',
  PublicStory: 'PublicStory',
};

const { nodeInterface, nodeField } = nodeDefinitions<GraphqlContext>(
  (globalId, context) => {
    const { db } = context;
    const { type, id } = fromGlobalId(globalId);
    const radiksType = mapGraphqlTypeToMongoCollection[type];
    if (!radiksType) {
      return null;
    }
    const radiksData = db.collection(config.radiksCollectionName);
    return radiksData.findOne({
      _id: id,
      radiksType,
    });
  },
  obj => {
    if (obj.publicKey) {
      return 'User';
    }
    if (obj.title) {
      return 'PublicStory';
    }
    return null;
  }
);

export { nodeInterface, nodeField };
