"use client";

import { IconCheck, IconExternalLink } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { usePostHog } from "posthog-js/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { appConfig } from "@/config";
import { cn } from "@/lib/cn";
import { PUBLISH_LIMITS } from "@/lib/plans";
import { sigleApiClient } from "@/lib/sigle";
import { formatReadableAddress } from "@/lib/stacks";
import { ProWelcomeDialog } from "./ProWelcomeDialog";

const FREE_FEATURES = [
  `${PUBLISH_LIMITS.free} posts per day`,
  "Embed images from a URL",
];

const PRO_FEATURES = [
  `${PUBLISH_LIMITS.pro} posts per day`,
  "Upload images to your posts",
  "Add cover images to your posts",
  "Embed images from a URL",
];

const FeatureList = ({ features }: { features: string[] }) => (
  <ul className="space-y-2">
    {features.map((feature) => (
      <li key={feature} className="flex items-center gap-2">
        <IconCheck size={16} className="text-primary" />
        {feature}
      </li>
    ))}
  </ul>
);

export const Plan = () => {
  const posthog = usePostHog();
  const queryClient = useQueryClient();
  const [isNftNotFound, setIsNftNotFound] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  // Set when the user opens the marketplace, so their wallet is checked again
  // when they come back to this tab.
  const hasOpenedMarketplace = useRef(false);

  const { data: me } = sigleApiClient.useQuery("get", "/api/me");
  const { data: limits } = sigleApiClient.useQuery("get", "/api/me/limits");

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
  // The usage is left out when it fails to load, so the plans and the
  // activation stay available.
  const publish = limits?.publish;

  return (
    <div className="space-y-5">
      <ProWelcomeDialog open={isWelcomeOpen} onOpenChange={setIsWelcomeOpen} />

      {publish ? (
        <Card>
          <CardContent className="space-y-2">
            <p>
              You published{" "}
              <span className="font-bold">
                {publish.used} of {publish.limit}
              </span>{" "}
              posts in the last 24 hours.
            </p>
            <Progress
              value={Math.min(100, (publish.used / publish.limit) * 100)}
            />
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              Free
              {!isPro ? <Badge variant="secondary">Current plan</Badge> : null}
            </CardTitle>
            <CardDescription>
              Everything you need to start writing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureList features={FREE_FEATURES} />
          </CardContent>
        </Card>

        <Card className={cn({ "ring-2 ring-primary": !isPro })}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              Pro
              {isPro ? <Badge>Current plan</Badge> : null}
            </CardTitle>
            <CardDescription>
              Unlocked by holding an Explorer Guild NFT
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureList features={PRO_FEATURES} />
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-2 border-t bg-muted/50 py-4">
            {isPro ? (
              <p className="text-muted-foreground">
                Pro stays active while {formatReadableAddress(me.address)} holds
                an Explorer Guild NFT.
              </p>
            ) : (
              <>
                <Button
                  nativeButton={false}
                  render={
                    <a
                      href={appConfig.explorerGuildMarketplaceUrl}
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                  onClick={() => {
                    hasOpenedMarketplace.current = true;
                    posthog.capture("upgrade_get_nft_clicked");
                  }}
                >
                  Get an Explorer Guild NFT
                  <IconExternalLink size={16} />
                </Button>
                <Button
                  variant="outline"
                  loading={refreshPlan.isPending}
                  onClick={() => checkWallet("button")}
                >
                  I have one, activate Pro
                </Button>
                {isNftNotFound ? (
                  <p className="text-muted-foreground">
                    No Explorer Guild NFT found in{" "}
                    {formatReadableAddress(me.address)}. A new purchase can take
                    a few minutes to reach your wallet.
                  </p>
                ) : null}
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
