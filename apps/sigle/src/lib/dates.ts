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

// Dates rendered on the server are hydrated in the reader's browser, so they
// are formatted in UTC from the date's parts: the local timezone, and the ICU
// data of `Intl`, can differ between the two and break hydration.

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
