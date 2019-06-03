import { User } from 'radiks';

class SigleUserModel extends User {
  static schema = {
    ...User.schema,
    name: {
      type: String,
      decrypted: true,
    },
  };
}

export const SigleUser = SigleUserModel as any;
