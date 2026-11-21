"use client";

import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack";
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PostHogInit, SuspendedPostHogPageView } from "./PostHog";

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });

let browserQueryClient: QueryClient | undefined = undefined;

// This module also runs on the server to render each request, so a client
// made at module level would share one cache between every request and user.
// The server makes one per request; the browser keeps one for the session.
// https://tanstack.com/query/v5/docs/framework/react/guides/advanced-ssr
const getQueryClient = () => {
  if (isServer) {
    return makeQueryClient();
  }

  browserQueryClient ??= makeQueryClient();

  return browserQueryClient;
};

export const Providers = ({ children }: { children: React.ReactNode }) => {
  // Not `useState`: React would drop it if a child suspends on first render.
  const queryClient = getQueryClient();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <AuthQueryProvider>
          <PostHogProvider client={posthog}>
            <PostHogInit />
            <SuspendedPostHogPageView />
            <Toaster closeButton />
            <TooltipProvider>{children}</TooltipProvider>
          </PostHogProvider>
        </AuthQueryProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};
