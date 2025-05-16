import { env } from "@/env";
import { createClient, type paths } from "@sigle/sdk";
import createOpenApiFetchClient from "openapi-fetch";
import createReactQueryClient from "openapi-react-query";
import { stacksNetwork } from "./stacks";

export const sigleClient = createClient({
  networkName: env.NEXT_PUBLIC_STACKS_ENV,
  network: stacksNetwork,
});

export const sigleApiFetchClient = createOpenApiFetchClient<paths>({
  baseUrl: env.NEXT_PUBLIC_API_URL,
  credentials: "include",
});

export const sigleApiClient = createReactQueryClient(sigleApiFetchClient);
