import { authClient } from "@/lib/auth-client";
import { createAuthHooks } from "@daveyplate/better-auth-tanstack";

/**
 * Using better-auth useSession is causing hydration errors on the homepage.
 * This plugin is the only way I found to fix those problems so far.
 */
const authHooks = createAuthHooks(authClient);

export const {
  useSession,
  usePrefetchSession,
  useToken,
  useListAccounts,
  useListSessions,
  useListDeviceSessions,
  useListPasskeys,
  useUpdateUser,
  useUnlinkAccount,
  useRevokeOtherSessions,
  useRevokeSession,
  useRevokeSessions,
  useSetActiveSession,
  useRevokeDeviceSession,
  useDeletePasskey,
  useAuthQuery,
  useAuthMutation,
} = authHooks;
