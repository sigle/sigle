import { createClient, sigleConfig } from "@sigle/sdk";
import { env } from "~/env";
import { stacksNetwork } from "./stacks";

const networkSigleConfig = sigleConfig[env.STACKS_ENV];

export const sigleClient = createClient({
  networkName: env.STACKS_ENV,
  network: stacksNetwork,
});

export { networkSigleConfig as sigleConfig };
