"use client";

import { useSyncExternalStore } from "react";
import {
  formatLocalDate,
  formatLocalDateTime,
  formatUtcDate,
  formatUtcDateTime,
} from "@/lib/dates";

interface LocalDateProps {
  date: Date | string;
  withTime?: boolean;
  className?: string;
}

const subscribe = () => () => {};

/**
 * The server and the browser must render the same text while hydrating, so
 * the server snapshot is the UTC text; React then re-renders with the
 * reader's own timezone and locale right after hydration.
 */
export const LocalDate = ({ date, withTime, className }: LocalDateProps) => {
  const local = withTime ? formatLocalDateTime : formatLocalDate;
  const utc = withTime ? formatUtcDateTime : formatUtcDate;
  const text = useSyncExternalStore(
    subscribe,
    () => local(date),
    () => utc(date),
  );

  return (
    <time
      dateTime={new Date(date).toISOString()}
      className={className}
      title={withTime ? formatUtcDateTime(date) : undefined}
    >
      {text}
    </time>
  );
};
