'use client';
import { Theme } from '@radix-ui/themes';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/modules/auth/AuthContext';

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
    <>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider disableTransitionOnChange attribute="class">
          <Theme grayColor="gray" accentColor="orange" radius="large">
            <SessionProvider>
              <AuthProvider>{children}</AuthProvider>
            </SessionProvider>
          </Theme>
        </ThemeProvider>
      </QueryClientProvider>
      <Toaster richColors closeButton position="bottom-right" />
    </>
  );
};
