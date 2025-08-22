"use client";

import { Grid, Heading } from "@radix-ui/themes";
import { GetFamiliarCards } from "@/components/Dashboard/GetFamiliarCards";
import { LatestDrafts } from "@/components/Dashboard/LatestDrafts";
import { LatestPost } from "@/components/Dashboard/LatestPost";
import { sigleApiClient } from "@/lib/sigle";

export default function Dashboard() {
  const { data: userWhitelist } = sigleApiClient.useQuery(
    "get",
    "/api/protected/user/whitelisted",
  );

  return (
    <div className="space-y-5 py-10">
      <Heading>Dashboard</Heading>

      {userWhitelist?.whitelisted ? (
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
