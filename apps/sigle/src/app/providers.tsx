"use client";

import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PostHogInit, SuspendedPostHogPageView } from "./PostHog";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export const Providers = ({ children }: { children: React.ReactNode }) => {
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
