import { definePlugin } from "nitro";
import { getWorld } from "workflow/runtime";
import { env } from "@/env";

export default definePlugin(async () => {
  process.env.WORKFLOW_TARGET_WORLD = "@workflow/world-postgres";
  process.env.WORKFLOW_POSTGRES_URL = env.DATABASE_URL;

  const world = await getWorld();
  await world.start?.();
});
