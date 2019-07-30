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
import { PublicStoryDb } from '../types';
import { config } from '../config';

export const PublicStoryType = new GraphQLObjectType<PublicStoryDb>({
  name: 'PublicStory',
  description: 'Public story data',
  fields: () => ({
    id: globalIdField('PublicStory', story => story._id),
    _id: {
      type: GraphQLNonNull(GraphQLString),
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
        width: {
          type: GraphQLInt,
        },
        height: {
          type: GraphQLInt,
        },
      },
      resolve: (story, args) => {
        let { width, height } = args;
        const coverImageUrl = story.coverImageUrl
          ? encodeURI(story.coverImageUrl)
          : null;
        if (coverImageUrl && config.gumletUrl) {
          return `${config.gumletUrl}/p/${coverImageUrl}?h=${height}&w=${width}&mode=crop`;
        }
        return coverImageUrl;
      },
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
      resolve: story => {
        // TODO use dataloader to batch the calls
        return UserModel.findOne({
          radiksType: 'BlockstackUser',
          _id: story.username,
        });
      },
      description: "The story's author",
    },
  }),
  interfaces: () => [nodeInterface],
});
