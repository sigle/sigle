import { Db } from 'mongodb';

export interface GraphqlContext {
  db: Db;
}

export interface UserDb {
  _id: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  username: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface PublicStoryDb {
  _id: string;
  title?: string;
  content?: string;
  excerpt?: string;
  coverImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: number;
  updatedAt?: number;
}
