import { env } from "@/env";
import createClient from "openapi-fetch";
import createReactQueryClient from "openapi-react-query";
import type { paths } from "./openapi";

export const sigleApiFetchclient = createClient<paths>({
  baseUrl: env.NEXT_PUBLIC_API_URL,
  credentials: "include",
});

export const sigleApiClient = createReactQueryClient(sigleApiFetchclient);
