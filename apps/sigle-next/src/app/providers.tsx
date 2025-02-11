"use client";

import { Theme } from "@radix-ui/themes";
import { ThemeProvider } from "next-themes";
import { PostHogProvider } from "posthog-js/react";
import { Toaster } from "sonner";
import posthog from "posthog-js";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Theme grayColor="gray" accentColor="orange" radius="large">
          <QueryClientProvider client={queryClient}>
            <PostHogProvider client={posthog}>
              <PostHogInit />
              <SuspendedPostHogPageView />
              {children}
              <Toaster closeButton />
            </PostHogProvider>
          </QueryClientProvider>
        </Theme>
      </ThemeProvider>
    </SessionProvider>
  );
};
