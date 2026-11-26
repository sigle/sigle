const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

// The server renders dates as UTC text built from the date's parts, so the
// server HTML and the browser's first render are identical (the timezone and
// the ICU data of `Intl` can differ between the two). After hydration the
// browser switches to the reader's own timezone and locale (see `LocalDate`).

/** "Nov 26, 2026", the UTC day of `date`. */
export const formatUtcDate = (date: Date | string): string => {
  const value = new Date(date);

  return `${MONTHS[value.getUTCMonth()]} ${value.getUTCDate()}, ${value.getUTCFullYear()}`;
};

/** "Nov 26, 2026, 14:05 UTC". */
export const formatUtcDateTime = (date: Date | string): string => {
  const value = new Date(date);
  const hours = String(value.getUTCHours()).padStart(2, "0");
  const minutes = String(value.getUTCMinutes()).padStart(2, "0");

  return `${formatUtcDate(value)}, ${hours}:${minutes} UTC`;
};

interface LocalFormatOptions {
  /** Only for tests: defaults to the browser's locale. */
  locale?: string;
  /** Only for tests: defaults to the browser's timezone. */
  timeZone?: string;
}

/** The day of `date` in the reader's timezone and locale. */
export const formatLocalDate = (
  date: Date | string,
  options?: LocalFormatOptions,
): string =>
  new Intl.DateTimeFormat(options?.locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: options?.timeZone,
  }).format(new Date(date));

/** The day and time of `date` in the reader's timezone and locale. */
export const formatLocalDateTime = (
  date: Date | string,
  options?: LocalFormatOptions,
): string =>
  new Intl.DateTimeFormat(options?.locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: options?.timeZone,
  }).format(new Date(date));
