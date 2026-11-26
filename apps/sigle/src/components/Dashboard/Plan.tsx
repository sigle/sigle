"use client";

import { IconArrowUpRight } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { usePostHog } from "posthog-js/react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
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

  // An Effect Event reads the latest `checkWallet`, so the listener is added
  // once.
  const onVisibilityChange = useEffectEvent(() => {
    if (
      document.visibilityState === "visible" &&
      hasOpenedMarketplace.current
    ) {
      hasOpenedMarketplace.current = false;
      checkWallet("marketplace_return");
    }
  });

  useEffect(() => {
    const listener = () => onVisibilityChange();

    document.addEventListener("visibilitychange", listener);

    return () => document.removeEventListener("visibilitychange", listener);
  }, []);

  if (!me) {
    return <h2 className="headline text-3xl">Plan</h2>;
  }

  const isPro = me.plan === "pro";

  const openMarketplace = () => {
    hasOpenedMarketplace.current = true;
    posthog.capture("upgrade_get_nft_clicked");
  };

  return (
    <div className="space-y-12">
      <ProWelcomeDialog open={isWelcomeOpen} onOpenChange={setIsWelcomeOpen} />

      <div>
        <h2 className="headline text-3xl">Plan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isPro
            ? "You're on Pro. Thanks for supporting Sigle."
            : "You're on the Free plan."}
        </p>
      </div>

      {!isPro ? (
        <section>
          <h3 className="headline text-2xl">Unlock Pro</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload images, get a verified badge and early access to new
            features.
          </p>

          <ol className="mt-4 grid gap-8 border-t border-border pt-6 md:grid-cols-2">
            <li className="flex flex-col">
              <span className="font-mono text-sm text-muted-foreground">
                01
              </span>
              <h4 className="mt-2 headline text-xl">
                Get an Explorer Guild NFT
              </h4>
              <p className="mt-1 mb-4 text-sm text-pretty text-muted-foreground">
                Pro is unlocked by holding one in your wallet. Pick one up on
                the Gamma marketplace.
              </p>
              <Button
                className="mt-auto w-fit"
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
                Browse on Gamma
                <IconArrowUpRight size={16} />
              </Button>
            </li>

            <li className="flex flex-col">
              <span className="font-mono text-sm text-muted-foreground">
                02
              </span>
              <h4 className="mt-2 headline text-xl">Activate Pro</h4>
              <p className="mt-1 mb-4 text-sm text-pretty text-muted-foreground">
                Once the NFT is in{" "}
                <span className="font-mono text-[0.9em] text-foreground">
                  {formatReadableAddress(me.address)}
                </span>
                , check your wallet to switch to Pro.
              </p>
              <Button
                variant="outline"
                className="mt-auto w-fit"
                loading={refreshPlan.isPending}
                onClick={() => checkWallet("button")}
              >
                Check my wallet
              </Button>
              {isNftNotFound ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  No Explorer Guild NFT found yet. A new purchase can take a few
                  minutes to reach your wallet.
                </p>
              ) : null}
            </li>
          </ol>
        </section>
      ) : null}

      <section>
        <h3 className="mb-4 headline text-2xl">
          {isPro ? "What's included" : "Compare plans"}
        </h3>
        <PlanComparison
          currentPlan={me.plan}
          onMarketplaceClick={openMarketplace}
          actions={{
            pro: isPro ? (
              <p className="text-sm text-muted-foreground">
                Pro stays active while {formatReadableAddress(me.address)} holds
                an Explorer Guild NFT.
              </p>
            ) : null,
          }}
        />
      </section>
    </div>
  );
};
