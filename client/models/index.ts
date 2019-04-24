import { Model } from 'radiks';

class PrivateStoryModel extends Model {
  static className = 'PrivateStory';

  static schema = {
    title: String,
    content: String,
  };
}

export const PrivateStory = PrivateStoryModel as any;
