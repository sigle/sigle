"use client";

import {
  connect,
  disconnect,
  getLocalStorage,
  isConnected,
  request,
} from "@stacks/connect";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import { createSiwsMessage } from "sign-in-with-stacks";
import { toast } from "sonner";
import { create } from "zustand";
import { env } from "@/env";
import { authClient, signOut } from "@/lib/auth-client";
import { useSession } from "@/lib/auth-hooks";
import { stacksNetwork } from "@/lib/stacks";

interface UserData {
  stxAddress: string;
}

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
    if (isConnected()) {
      const data = getLocalStorage();
      const stxAddress = data?.addresses.stx[0];
      if (!stxAddress) return;
      const user = {
        stxAddress: stxAddress.address,
      };
      setUser(user);
    }
  }, [setUser]);

  const login = async () => {
    posthog.capture("user_login_start");
    try {
      const response = await connect({
        forceWalletSelect: true,
        network: env.NEXT_PUBLIC_STACKS_ENV,
      });
      const stxAddress = response.addresses.find(
        (address) => address.symbol === "STX",
      );
      if (!stxAddress) {
        throw new Error("No STX address found");
      }
      const user = {
        stxAddress: stxAddress.address,
      };
      posthog.capture("user_login_wallet_success", {
        stxAddress: user.stxAddress,
      });
      setUser(user);
      signMessage(user);
    } catch (error) {
      console.error(error);
      posthog.capture("user_login_cancel");
    }
  };

  const signMessage = async (user: UserData) => {
    posthog.capture("user_login_sign_message");

    const nonceData = await authClient.siws.nonce({ address: user.stxAddress });
    if (!nonceData.data?.nonce) {
      toast.error("Nonce not found");
      return;
    }

    const message = createSiwsMessage({
      address: user.stxAddress,
      chainId: stacksNetwork.chainId,
      domain: window.location.host,
      statement: "Sign in to Sigle.",
      nonce: nonceData.data.nonce,
      uri: window.location.origin,
      version: "1",
    });

    let signature: string;
    try {
      const response = await request("stx_signMessage", {
        message,
      });
      signature = response.signature;
    } catch (error) {
      console.error(error);
      posthog.capture("user_login_sign_message_error");
      toast.error("Failed to login");
      return;
    }

    const signInResult = await authClient.siws.verify({
      address: user.stxAddress,
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
  };

  const logout = async () => {
    posthog.capture("user_logout");
    disconnect();
    await signOut();
    window.location.href = "/api/logout";
  };

  return {
    user,
    login,
    logout,
  };
};
