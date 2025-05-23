import { env } from "@/env";
import type { paths } from "@sigle/sdk";
import createOpenApiFetchClient from "openapi-fetch";

export const sigleApiFetchClient = createOpenApiFetchClient<paths>({
  baseUrl: env.NEXT_PUBLIC_API_URL,
  credentials: "include",
});
