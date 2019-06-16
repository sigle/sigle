import { Db } from 'mongodb';

export interface GraphqlContext {
  db: Db;
}
