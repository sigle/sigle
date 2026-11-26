import { describe, expect, it } from "vite-plus/test";
import { formatUtcDate, formatUtcDateTime } from "./dates";

const restoreTz = (previous: string | undefined) => {
  if (previous === undefined) {
    delete process.env.TZ;
  } else {
    process.env.TZ = previous;
  }
};

describe(formatUtcDate, () => {
  it("formats the UTC day late in the day", () => {
    expect(formatUtcDate("2026-11-26T23:30:00.000Z")).toBe("Nov 26, 2026");
  });

  it("accepts a Date", () => {
    expect(formatUtcDate(new Date("2026-01-01T00:00:00.000Z"))).toBe(
      "Jan 1, 2026",
    );
  });

  it("does not depend on the process timezone", () => {
    const previous = process.env.TZ;

    try {
      process.env.TZ = "Pacific/Kiritimati";
      expect(formatUtcDate("2026-11-26T23:30:00.000Z")).toBe("Nov 26, 2026");
    } finally {
      restoreTz(previous);
    }
  });
});

describe(formatUtcDateTime, () => {
  it("zero-pads hours and minutes", () => {
    expect(formatUtcDateTime("2026-11-26T04:05:00.000Z")).toBe(
      "Nov 26, 2026, 04:05 UTC",
    );
  });
});
