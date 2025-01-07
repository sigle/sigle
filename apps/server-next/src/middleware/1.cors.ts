import { corsEventHandler } from 'nitro-cors';
import { env } from '~/env';

export default corsEventHandler((_event) => {}, {
  origin: (origin) => {
    if (origin === env.APP_URL) {
      return true;
    }
    return false;
  },
  methods: '*',
  credentials: true,
});
