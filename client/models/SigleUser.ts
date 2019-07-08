import { User } from 'radiks';

class SigleUserModel extends User {
  static schema = {
    ...User.schema,
    name: {
      type: String,
      decrypted: true,
    },
    description: {
      type: String,
      decrypted: true,
    },
    imageUrl: {
      type: String,
      decrypted: true,
    },
  };
}

// TODO remove any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SigleUser = SigleUserModel as any;
