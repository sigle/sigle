"use client";

import { ErrorPage } from "@/components/Shared/ErrorPage";

export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return <ErrorPage error={error} retry={retry} />;
}
