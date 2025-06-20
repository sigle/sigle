import { Grid, Heading } from "@radix-ui/themes";
import { GetFamiliarCards } from "@/components/Dashboard/GetFamiliarCards";
import { LatestDrafts } from "@/components/Dashboard/LatestDrafts";
import { LatestPost } from "@/components/Dashboard/LatestPost";

export default function Dashboard() {
  return (
    <div className="space-y-5 py-10">
      <Heading>Dashboard</Heading>

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

      <GetFamiliarCards />
    </div>
  );
}
