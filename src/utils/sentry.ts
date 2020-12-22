import * as Sentry from '@sentry/node';
import { RewriteFrames } from '@sentry/integrations';
import { sigleConfig } from '../config';

export const initSentry = () => {
  if (sigleConfig.sentryDsn) {
    const integrations = [];
    const nextRootDir = process.env.NEXT_PUBLIC_SENTRY_SERVER_ROOT_DIR;
    if (process.env.NEXT_IS_SERVER === 'true' && nextRootDir) {
      // For Node.js, rewrite Error.stack to use relative paths, so that source
      // maps starting with ~/_next map to files in Error.stack with path
      // app:///_next
      integrations.push(
        new RewriteFrames({
          iteratee: (frame) => {
            frame.filename = frame.filename?.replace(nextRootDir, 'app:///');
            frame.filename = frame.filename?.replace('.next', '_next');
            return frame;
          },
        })
      );
    }

    Sentry.init({
      enabled: sigleConfig.env === 'production',
      integrations,
      dsn: sigleConfig.sentryDsn,
      release: process.env.NEXT_PUBLIC_COMMIT_SHA,
    });
  }
};
