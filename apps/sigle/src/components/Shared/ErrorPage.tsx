"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { StatusPage } from "./StatusPage";

interface ErrorPageProps {
  error: unknown;
  retry: () => void;
}

/** The page of the `error.tsx` and `global-error.tsx` boundaries. */
export const ErrorPage = ({ error, retry }: ErrorPageProps) => {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  // Errors from Server Components carry an identifier of the server logs.
  const digest =
    error instanceof Error && "digest" in error ? String(error.digest) : null;

  return (
    <StatusPage
      label="Error"
      title="Something went wrong"
      description={
        <>
          <p>
            An unexpected error stopped this page from loading. Try again, or
            come back in a moment.
          </p>
          {digest ? (
            <p className="mt-3 text-sm">
              Reference <span className="font-mono">{digest}</span>
            </p>
          ) : null}
        </>
      }
    >
      <title>Something went wrong | Sigle</title>
      <Button size="lg" onClick={() => retry()}>
        Try again
      </Button>
      <a
        href="/"
        className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
      >
        Back to home
      </a>
    </StatusPage>
  );
};
