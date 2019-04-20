import { Model } from 'radiks';

export class PrivateStory extends Model {
  static className = 'PrivateStory';

  static schema = {
    title: String,
    content: String,
  };
}
