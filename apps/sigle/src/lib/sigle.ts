import type { paths } from "@sigle/sdk";
import createOpenApiFetchClient from "openapi-fetch";
import createReactQueryClient from "openapi-react-query";
import { env } from "@/env";
import { currentVisitorIp, VISITOR_IP_HEADER } from "@/lib/visitor-ip";

const isServer = typeof window === "undefined";

export const sigleApiFetchClient = createOpenApiFetchClient<paths>({
  // On the server, call the API over Railway's private network when set.
  baseUrl:
    (isServer ? env.API_INTERNAL_URL : undefined) ?? env.NEXT_PUBLIC_API_URL,
  credentials: "include",
});

if (isServer) {
  // The API rate limits by client IP. Server-side calls carry the visitor's
  // IP, else every visitor would share the website's limit.
  sigleApiFetchClient.use({
    onRequest: ({ request }) => {
      const ip = currentVisitorIp();

      if (ip !== undefined) {
        request.headers.set(VISITOR_IP_HEADER, ip);
      }

      return request;
    },
  });
}

export const sigleApiClient = createReactQueryClient(sigleApiFetchClient);
