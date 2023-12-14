'use client';
import { Theme } from '@radix-ui/themes';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ThemeProvider disableTransitionOnChange attribute="class">
        <Theme grayColor="gray" accentColor="orange" radius="large">
          <SessionProvider>{children}</SessionProvider>
        </Theme>
      </ThemeProvider>
      <Toaster richColors closeButton position="bottom-right" />
    </>
  );
};
