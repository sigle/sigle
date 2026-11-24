"use client";

import "./globals.css";
import { ErrorPage } from "@/components/Shared/ErrorPage";
import { cn } from "@/lib/cn";
import { inter, newsreader } from "./fonts";

// Replaces the root layout when it fails, so it renders its own document.
export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, newsreader.variable, "antialiased")}>
        <ErrorPage error={error} retry={retry} />
      </body>
    </html>
  );
}
