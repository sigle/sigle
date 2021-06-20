import * as Sentry from '@sentry/nextjs';
import { apiFeed } from '../../../pages-lib/api/feed/[username]';

export default Sentry.withSentry(apiFeed);
