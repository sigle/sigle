import { env } from "@/env";
import { createClient } from "@sigle/sdk";
import { stacksNetwork } from "./stacks";

export const sigleClient = createClient({
  networkName: env.NEXT_PUBLIC_STACKS_ENV,
  network: stacksNetwork,
});
