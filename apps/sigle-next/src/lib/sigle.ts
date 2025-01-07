import { createClient } from '@sigle/sdk';
import { stacksNetwork } from './stacks';
import { env } from '@/env';

export const sigleClient = createClient({
  networkName: env.NEXT_PUBLIC_STACKS_ENV,
  network: stacksNetwork,
});
