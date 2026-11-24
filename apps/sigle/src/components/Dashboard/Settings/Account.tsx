"use client";

import { NextLink } from "@/components/Shared/NextLink";
import { sigleApiClient } from "@/lib/sigle";
import { SettingsRow } from "./SettingsRow";

export const SettingsAccount = () => {
  const { data: me } = sigleApiClient.useQuery("get", "/api/me");

  if (!me) {
    return null;
  }

  return (
    <section>
      <h3 className="headline text-2xl">Account</h3>

      <div className="mt-4 border-t border-border">
        <SettingsRow
          label="Wallet"
          description="The Stacks address you sign in with."
        >
          <p className="font-mono text-sm break-all">{me.address}</p>
        </SettingsRow>

        <SettingsRow label="Plan">
          <p className="text-sm">
            {me.plan === "pro" ? "Pro" : "Free"} ·{" "}
            <NextLink
              href="/dashboard/plan"
              className="underline underline-offset-4"
            >
              {me.plan === "pro" ? "View plan" : "Upgrade to Pro"}
            </NextLink>
          </p>
        </SettingsRow>
      </div>
    </section>
  );
};
