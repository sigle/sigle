"use client";

import { IconExternalLink } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { usePostHog } from "posthog-js/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/config";
import { sigleApiClient } from "@/lib/sigle";
import { formatReadableAddress } from "@/lib/stacks";
import { PlanComparison } from "../Shared/PlanComparison";
import { ProWelcomeDialog } from "./ProWelcomeDialog";

export const Plan = () => {
  const posthog = usePostHog();
  const queryClient = useQueryClient();
  const [isNftNotFound, setIsNftNotFound] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  // Set when the user opens the marketplace, so their wallet is checked again
  // when they come back to this tab.
  const hasOpenedMarketplace = useRef(false);

  const { data: me } = sigleApiClient.useQuery("get", "/api/me");

  const refreshPlan = sigleApiClient.useMutation(
    "post",
    "/api/me/plan/refresh",
  );

  useEffect(() => {
    posthog.capture("upgrade_page_viewed");
  }, [posthog]);

  const checkWallet = (source: "button" | "marketplace_return") => {
    posthog.capture("upgrade_refresh_clicked", { source });
    setIsNftNotFound(false);

    refreshPlan.mutate(
      {},
      {
        onSuccess: async ({ plan }) => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["get", "/api/me"] }),
            queryClient.invalidateQueries({
              queryKey: ["get", "/api/me/limits"],
            }),
          ]);

          if (plan === "pro") {
            posthog.capture("upgrade_activated", { source });
            setIsWelcomeOpen(true);
          } else {
            setIsNftNotFound(true);
          }
        },
        onError: (error) => {
          toast.error(error?.message ?? "Failed to check your wallet.");
        },
      },
    );
  };

  useEffect(() => {
    const onVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        hasOpenedMarketplace.current
      ) {
        hasOpenedMarketplace.current = false;
        checkWallet("marketplace_return");
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  });

  if (!me) {
    return null;
  }

  const isPro = me.plan === "pro";

  const openMarketplace = () => {
    hasOpenedMarketplace.current = true;
    posthog.capture("upgrade_get_nft_clicked");
  };

  return (
    <>
      <ProWelcomeDialog open={isWelcomeOpen} onOpenChange={setIsWelcomeOpen} />

      <PlanComparison
        currentPlan={me.plan}
        onMarketplaceClick={openMarketplace}
        actions={{
          pro: isPro ? (
            <p className="text-sm text-muted-foreground">
              Pro stays active while {formatReadableAddress(me.address)} holds
              an Explorer Guild NFT.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                nativeButton={false}
                render={
                  <a
                    href={appConfig.explorerGuildMarketplaceUrl}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
                onClick={openMarketplace}
              >
                Get an Explorer Guild NFT
                <IconExternalLink size={16} />
              </Button>
              <Button
                size="lg"
                variant="outline"
                loading={refreshPlan.isPending}
                onClick={() => checkWallet("button")}
              >
                I have one, activate Pro
              </Button>
              {isNftNotFound ? (
                <p className="text-sm text-muted-foreground">
                  No Explorer Guild NFT found in{" "}
                  {formatReadableAddress(me.address)}. A new purchase can take a
                  few minutes to reach your wallet.
                </p>
              ) : null}
            </div>
          ),
        }}
      />
    </>
  );
};
