import type { paths } from "@sigle/sdk";
import createOpenApiFetchClient from "openapi-fetch";
import { env } from "@/env";

export const sigleApiFetchClient = createOpenApiFetchClient<paths>({
  baseUrl: env.NEXT_PUBLIC_API_URL,
  credentials: "include",
});
