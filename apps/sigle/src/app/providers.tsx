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

// On the server, a client shared across requests would serve every visitor the
// first render's data forever, so each render gets its own.
const getQueryClient = () => {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();

  return browserQueryClient;
};

export const Providers = ({ children }: { children: React.ReactNode }) => {
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
