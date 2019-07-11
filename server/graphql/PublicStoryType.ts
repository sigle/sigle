import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
} from 'graphql';
import { globalIdField } from 'graphql-relay';
import { nodeInterface } from './nodeInterface';
import { UserType } from './UserType';
import { UserModel } from '../models';

export const PublicStoryType = new GraphQLObjectType({
  name: 'PublicStory',
  description: 'Public story data',
  fields: () => ({
    id: globalIdField('PublicStory', story => story._id),
    _id: {
      type: GraphQLString,
      resolve: story => story._id,
      description: "The story's mongodb id",
    },
    title: {
      type: GraphQLString,
      resolve: story => story.title,
      description: "The story's public title",
    },
    content: {
      type: GraphQLString,
      resolve: story => story.content,
      description: "The story's public content",
    },
    coverImageUrl: {
      type: GraphQLString,
      args: {
        size: {
          type: GraphQLInt,
        },
      },
      resolve: story => story.coverImageUrl,
      description: 'A url pointing to the story cover image',
    },
    excerpt: {
      type: GraphQLString,
      resolve: story => story.excerpt,
      description: "The story's public excerpt",
    },
    metaTitle: {
      type: GraphQLString,
      resolve: story => story.metaTitle,
      description: "The story's public metaTitle",
    },
    metaDescription: {
      type: GraphQLString,
      resolve: story => story.metaDescription,
      description: "The story's public metaDescription",
    },
    createdAt: {
      type: GraphQLString,
      resolve: story => story.createdAt,
      description: "The story's public creation date",
    },
    user: {
      type: GraphQLNonNull(UserType),
      resolve: () => {
        // TODO see how to link the story to the user
        // TODO use dataloader to batch the calls
        return UserModel.findOne({
          radiksType: 'BlockstackUser',
          _id: 'leopradel.id.blockstack',
        });
      },
      description: "The story's author",
    },
  }),
  interfaces: () => [nodeInterface],
});
