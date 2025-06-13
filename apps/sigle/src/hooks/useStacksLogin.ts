"use client";

import { env } from "@/env";
import { authClient, signOut } from "@/lib/auth-client";
import { useSession } from "@/lib/auth-hooks";
import { appDetails, stacksNetwork, userSession } from "@/lib/stacks";
import {
  type UserData,
  openSignatureRequestPopup,
  showConnect,
} from "@stacks/connect";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import { createSiwsMessage } from "sign-in-with-stacks";
import { toast } from "sonner";
import { create } from "zustand";

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
  const { refetch: refetchSession } = useSession();

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
    posthog.capture("user_login_start");
    showConnect({
      appDetails,
      userSession,
      onFinish: () => {
        const userData = userSession.loadUserData();
        setUser(userData);
        posthog.capture("user_login_wallet_success");
        signMessage();
      },
      onCancel: () => {
        posthog.capture("user_login_cancel");
      },
    });
  };

  const signMessage = async () => {
    posthog.capture("user_login_sign_message");
    const userData = userSession.loadUserData();

    const address =
      env.NEXT_PUBLIC_STACKS_ENV === "mainnet"
        ? userData.profile.stxAddress.mainnet
        : userData.profile.stxAddress.testnet;

    const nonceData = await authClient.siws.nonce({ address });
    if (!nonceData.data?.nonce) {
      toast.error("Nonce not found");
      return;
    }

    const message = createSiwsMessage({
      address,
      chainId: stacksNetwork.chainId,
      domain: window.location.host,
      statement: "Sign in to Sigle.",
      nonce: nonceData.data.nonce,
      uri: window.location.origin,
      version: "1",
    });

    await openSignatureRequestPopup({
      network: stacksNetwork,
      message,
      onFinish: async ({ signature }) => {
        const signInResult = await authClient.siws.verify({
          address,
          message,
          signature,
        });
        if (signInResult.error) {
          posthog.capture("user_login_sign_message_error", {
            code: signInResult.error.code,
            error: signInResult.error.message,
          });
          toast.error("Failed to login");
          return;
        }
        refetchSession();
        posthog.capture("user_login_sign_message_success");
        toast.success("You are now logged in");
      },
      onCancel: () => {
        posthog.capture("user_login_sign_message_cancel");
      },
    });
  };

  const logout = async () => {
    posthog.capture("user_logout");
    userSession.signUserOut("/");
    await signOut();
  };

  return {
    user,
    login,
    logout,
  };
};
