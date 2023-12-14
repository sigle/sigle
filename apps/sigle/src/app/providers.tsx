import { Theme } from '@radix-ui/themes';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ThemeProvider disableTransitionOnChange attribute="class">
        <Theme grayColor="gray" accentColor="orange" radius="large">
          {children}
        </Theme>
      </ThemeProvider>
      <Toaster richColors closeButton position="bottom-right" />
    </>
  );
};
