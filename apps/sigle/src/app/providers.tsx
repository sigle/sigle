"use client";

import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack";
import { Theme } from "@radix-ui/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { Toaster } from "sonner";
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
      <Theme grayColor="gray" accentColor="orange" radius="large">
        <QueryClientProvider client={queryClient}>
          <AuthQueryProvider>
            <PostHogProvider client={posthog}>
              <PostHogInit />
              <SuspendedPostHogPageView />
              {children}
              <Toaster closeButton />
            </PostHogProvider>
          </AuthQueryProvider>
        </QueryClientProvider>
      </Theme>
    </ThemeProvider>
  );
};
