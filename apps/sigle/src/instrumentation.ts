import type { IncomingMessage } from "node:http";
import * as Sentry from "@sentry/nextjs";

export const onRequestError = Sentry.captureRequestError;

/**
 * Makes the visitor's IP of each request available to the API calls made
 * while handling it (`currentVisitorIp`), including from client components
 * rendered on the server, which can't read the request headers. Node
 * publishes `http.server.request.start` just before the server emits the
 * request, so the IP entered here holds for all the work that handles it.
 */
const trackVisitorIp = async () => {
  const [{ AsyncLocalStorage }, { subscribe }, visitorIp] = await Promise.all([
    import("node:async_hooks"),
    import("node:diagnostics_channel"),
    import("@/lib/visitor-ip"),
  ]);

  const store = new AsyncLocalStorage<string | undefined>();
  visitorIp.setVisitorIpStore(store);

  subscribe("http.server.request.start", (message) => {
    // SAFETY: Node publishes `{ request, response, socket, server }` on this
    // channel, `request` being the server's `IncomingMessage`.
    const { request } = message as { request: IncomingMessage };

    // Entered even when missing, so a request never keeps another's IP.
    store.enterWith(request.headersDistinct[visitorIp.VISITOR_IP_HEADER]?.[0]);
  });
};

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await trackVisitorIp();

    // Railway sets the OTLP endpoint, headers and service name on traced
    // services. Without them, nothing registers and no span is recorded.
    if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
      const [{ registerOTel }, { env }] = await Promise.all([
        import("@vercel/otel"),
        import("@/env"),
      ]);

      registerOTel({
        instrumentationConfig: {
          fetch: {
            // Continue the trace into the API: off Vercel, the `traceparent`
            // header is only sent to the URLs listed here.
            propagateContextUrls: [
              env.NEXT_PUBLIC_API_URL,
              ...(env.API_INTERNAL_URL ? [env.API_INTERNAL_URL] : []),
            ],
            // Sending errors to Sentry is not part of the request, but would
            // show up as a span in its trace.
            ignoreUrls: env.NEXT_PUBLIC_SENTRY_DSN
              ? [new URL(env.NEXT_PUBLIC_SENTRY_DSN).origin]
              : [],
          },
        },
      });
    }

    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
