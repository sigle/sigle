"use client";

import { Callout, Grid, Heading } from "@radix-ui/themes";
import { IconInfoCircle } from "@tabler/icons-react";
import { GetFamiliarCards } from "@/components/Dashboard/GetFamiliarCards";
import { LatestDrafts } from "@/components/Dashboard/LatestDrafts";
import { LatestPost } from "@/components/Dashboard/LatestPost";
import { sigleApiClient } from "@/lib/sigle";

export default function Dashboard() {
  const { data: userWhitelist, isLoading: isLoadingWhitelist } =
    sigleApiClient.useQuery("get", "/api/protected/user/whitelisted");

  return (
    <div className="space-y-5 py-10">
      <Heading>Dashboard</Heading>

      {!isLoadingWhitelist && !userWhitelist?.whitelisted ? (
        <Callout.Root color="gray">
          <Callout.Icon>
            <IconInfoCircle />
          </Callout.Icon>
          <Callout.Text>
            Publishing is currrently restricted to whitelisted users only. If
            you are interested in participating in the Sigle beta, please let us
            know on Discord.
          </Callout.Text>
        </Callout.Root>
      ) : null}

      {!isLoadingWhitelist && userWhitelist?.whitelisted ? (
        <Grid
          columns={{
            initial: "1",
            md: "2",
          }}
          gap="5"
          width="auto"
        >
          <LatestPost />
          <LatestDrafts />
        </Grid>
      ) : null}

      <GetFamiliarCards />
    </div>
  );
}
