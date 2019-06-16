// @ts-ignore
import { COLLECTION } from 'radiks-server/app/lib/constants';

export const config = {
  mongoDBUrl:
    process.env.MONGODB_URL || 'mongodb://localhost:27017/sigle-server',
  radiksCollectionName: COLLECTION as string,
};
