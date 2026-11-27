"use client";

import { connect, disconnect, request } from "@stacks/connect";
import { usePostHog } from "posthog-js/react";
import { createSiwsMessage } from "sign-in-with-stacks";
import { toast } from "sonner";
import { env } from "@/env";
import { authClient, signOut } from "@/lib/auth-client";
import { useSession } from "@/lib/auth-hooks";
import { stacksNetwork } from "@/lib/stacks";

export const useStacksLogin = () => {
  const posthog = usePostHog();
  const { refetch: refetchSession } = useSession();

  const login = async () => {
    posthog.capture("user_login_start");

    try {
      const response = await connect({
        forceWalletSelect: true,
        // TODO network is not working in xverse, it throws an error
        // see https://github.com/hirosystems/connect/issues/460
        // network: env.NEXT_PUBLIC_STACKS_ENV,
      });

      const stxAddress = response.addresses.find((address) =>
        env.NEXT_PUBLIC_STACKS_ENV === "mainnet"
          ? address.address.startsWith("SP")
          : address.address.startsWith("ST"),
      );

      if (!stxAddress) {
        throw new Error("No STX address found");
      }

      posthog.capture("user_login_wallet_success", {
        stxAddress: stxAddress.address,
      });
      void signMessage(stxAddress.address);
    } catch {
      posthog.capture("user_login_cancel");
    }
  };

  const signMessage = async (address: string) => {
    posthog.capture("user_login_sign_message");

    const nonceData = await authClient.siws.nonce();

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

    let signature: string;

    try {
      const response = await request("stx_signMessage", {
        message,
      });

      signature = response.signature;
    } catch {
      posthog.capture("user_login_sign_message_error");
      toast.error("Failed to login");

      return;
    }

    const signInResult = await authClient.siws.verify({
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

    void refetchSession();
    posthog.capture("user_login_sign_message_success");
    toast.success("You are now logged in");
  };

  const logout = async () => {
    posthog.capture("user_logout");
    // Forget the user, otherwise the next visitor of this browser is
    // tracked as them.
    posthog.reset();
    disconnect();
    await signOut();
    // Force reload to clear session
    window.location.reload();
  };

  return {
    login,
    logout,
  };
};
