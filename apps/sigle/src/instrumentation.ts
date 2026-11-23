import * as Sentry from "@sentry/nextjs";

export const onRequestError = Sentry.captureRequestError;

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
