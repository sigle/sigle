import type { Instrumentation } from "next";

// Reports errors of server renders, route handlers and server actions to
// PostHog error tracking. There are no Edge routes, so only Node.js reports.
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const [{ getPostHogServer }, { env }] = await Promise.all([
    import("@/lib/posthog-server"),
    import("@/env"),
  ]);

  getPostHogServer()?.captureException(error, {
    properties: {
      environment: env.NEXT_PUBLIC_STACKS_ENV,
      path: request.path,
      method: request.method,
      routePath: context.routePath,
      routeType: context.routeType,
      routerKind: context.routerKind,
    },
  });
};

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
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
            // Sending errors to PostHog is not part of the request, but would
            // show up as a span in its trace.
            ignoreUrls: env.NEXT_PUBLIC_POSTHOG_HOST
              ? [new URL(env.NEXT_PUBLIC_POSTHOG_HOST).origin]
              : [],
          },
        },
      });
    }
  }
}
