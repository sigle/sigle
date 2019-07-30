import { Model } from 'radiks';

class PublicStoryModel extends Model {
  static className = 'PublicStory';

  static validateUsername = true;

  static schema = {
    title: {
      type: String,
      decrypted: true,
    },
    content: {
      type: String,
      decrypted: true,
    },
    excerpt: {
      type: String,
      decrypted: true,
    },
    coverImageUrl: {
      type: String,
      decrypted: true,
    },
    metaTitle: {
      type: String,
      decrypted: true,
    },
    metaDescription: {
      type: String,
      decrypted: true,
    },
  };
}

// TODO remove any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PublicStory = PublicStoryModel as any;
