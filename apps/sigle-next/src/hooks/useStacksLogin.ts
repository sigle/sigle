import { appDetails, stacksNetwork, userSession } from '@/lib/stacks';
import {
  openSignatureRequestPopup,
  showConnect,
  type UserData,
} from '@stacks/connect';
import { createSiwsMessage } from '@sigle/sign-in-with-stacks';
import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';
import { create } from 'zustand';
import { getCsrfToken, signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { env } from '@/env';

interface SessionState {
  user?: UserData;
  setUser: (user?: UserData) => void;
}

const useSessionStore = create<SessionState>()((set) => ({
  user: undefined,
  setUser: (user) => set({ user }),
}));

export const useStacksLogin = () => {
  const posthog = usePostHog();
  const { user, setUser } = useSessionStore();

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUser(userData);
      });
    } else if (userSession.isUserSignedIn()) {
      setUser(userSession.loadUserData());
    }
  }, [setUser]);

  const login = () => {
    posthog.capture('user_login_start');
    showConnect({
      appDetails,
      userSession,
      onFinish: () => {
        const userData = userSession.loadUserData();
        setUser(userData);
        posthog.capture('user_login_wallet_success');
        signMessage();
      },
      onCancel: () => {
        posthog.capture('user_login_cancel');
      },
    });
  };

  const signMessage = async () => {
    posthog.capture('user_login_sign_message');
    const userData = userSession.loadUserData();

    const address =
      env.NEXT_PUBLIC_STACKS_ENV === 'mainnet'
        ? userData.profile.stxAddress.mainnet
        : userData.profile.stxAddress.testnet;

    const message = createSiwsMessage({
      address,
      chainId: stacksNetwork.chainId,
      domain: window.location.host,
      statement: 'Sign in to Sigle.',
      nonce: await getCsrfToken(),
      uri: window.location.origin,
      version: '1',
    });

    await openSignatureRequestPopup({
      network: stacksNetwork,
      message,
      onFinish: async ({ signature }) => {
        const signInResult = await signIn('credentials', {
          address,
          message: message,
          signature,
          redirect: false,
        });
        if (signInResult?.error) {
          posthog.capture('user_login_sign_message_error', {
            code: signInResult.code,
            error: signInResult.error,
          });
          toast.error('Failed to login');
          return;
        }
        if (signInResult?.ok && !signInResult?.error) {
          posthog.capture('user_login_sign_message_success');
          toast.success('You are now logged in');
        }
      },
      onCancel: () => {
        posthog.capture('user_login_sign_message_cancel');
      },
    });
  };

  const logout = async () => {
    posthog.capture('user_logout');
    userSession.signUserOut('/');
    window.location.href = '/api/logout';
  };

  return {
    user,
    login,
    logout,
  };
};
