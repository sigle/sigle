import { env } from "@/env";
import type { paths } from "@sigle/sdk";
import createClient from "openapi-fetch";
import createReactQueryClient from "openapi-react-query";

export const sigleApiFetchclient = createClient<paths>({
  baseUrl: env.NEXT_PUBLIC_API_URL,
  credentials: "include",
});

export const sigleApiClient = createReactQueryClient(sigleApiFetchclient);
