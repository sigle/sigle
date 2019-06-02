import { Model } from 'radiks';

class PublicStoryModel extends Model {
  static className = 'PublicStory';

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
  };
}

export const PublicStory = PublicStoryModel as any;
