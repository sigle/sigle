import mongoose, { Schema } from 'mongoose';

const PublicStorySchema = new Schema({
  title: String,
  content: String,
  excerpt: String,
  metaTitle: String,
  metaDescription: String,
});

export const PublicStoryModel = mongoose.model(
  'PublicStory',
  PublicStorySchema,
  'radiks-server-data'
);
