import type { paths } from "@sigle/sdk";
import createOpenApiFetchClient from "openapi-fetch";
import createReactQueryClient from "openapi-react-query";
import { env } from "@/env";

export const sigleApiFetchClient = createOpenApiFetchClient<paths>({
  // On the server, call the API over Railway's private network when set,
  // where the API doesn't rate limit reads (see `API_INTERNAL_URL`).
  baseUrl:
    (typeof window === "undefined" ? env.API_INTERNAL_URL : undefined) ??
    env.NEXT_PUBLIC_API_URL,
  credentials: "include",
});

export const sigleApiClient = createReactQueryClient(sigleApiFetchClient);
