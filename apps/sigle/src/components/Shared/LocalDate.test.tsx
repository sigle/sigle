import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";
import { formatLocalDate } from "@/lib/dates";
import { LocalDate } from "./LocalDate";

const DATE = "2026-11-26T23:30:00.000Z";

const restoreTz = (previous: string | undefined) => {
  if (previous === undefined) {
    delete process.env.TZ;
  } else {
    process.env.TZ = previous;
  }
};

describe(LocalDate, () => {
  let previousTz: string | undefined;

  beforeEach(() => {
    previousTz = process.env.TZ;
    process.env.TZ = "Asia/Tokyo";
  });

  afterEach(() => {
    restoreTz(previousTz);
  });

  it("hydrates the UTC text, then shows the reader's local date", async () => {
    const html = renderToString(<LocalDate date={DATE} />);

    expect(html).toContain("Nov 26, 2026");

    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.append(container);
    const errors: Array<unknown> = [];

    await act(async () => {
      hydrateRoot(container, <LocalDate date={DATE} />, {
        onRecoverableError: (error) => {
          errors.push(error);
        },
      });
    });

    expect(errors).toStrictEqual([]);
    expect(container.textContent).toBe(formatLocalDate(DATE));
    expect(container.textContent).not.toBe("Nov 26, 2026");

    container.remove();
  });
});
