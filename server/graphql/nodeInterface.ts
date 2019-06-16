import { fromGlobalId, nodeDefinitions } from 'graphql-relay';
import { GraphqlContext } from '../types';
import { config } from '../config';

const mapGraphqlTypeToMongoCollection: { [key: string]: string } = {
  User: 'BlockstackUser',
};

const { nodeInterface, nodeField } = nodeDefinitions<GraphqlContext>(
  (globalId, context) => {
    const { db } = context;
    var { type, id } = fromGlobalId(globalId);
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
    return null;
  }
);

export { nodeInterface, nodeField };
