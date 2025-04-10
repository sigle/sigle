import { sigleConfig } from "@sigle/sdk";
import { env } from "~/env";

const networkSigleConfig = sigleConfig[env.STACKS_ENV];

export { networkSigleConfig as sigleConfig };
