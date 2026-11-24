import { describe, expect, it } from "vite-plus/test";
import { getNextOffset, removeFromPages } from "./pagination";

const page = (offset: number, ids: string[], total: number) => ({
  offset,
  total,
  results: ids.map((id) => ({ id })),
});

describe(removeFromPages, () => {
  it("keeps the next page starting after the last loaded item", () => {
    // 5 items loaded out of 6, the 2nd one is removed.
    const pages = removeFromPages(
      [page(0, ["a", "b"], 6), page(2, ["c", "d"], 6), page(4, ["e"], 6)],
      "b",
    );

    expect({
      pages,
      nextOffset: getNextOffset(pages[pages.length - 1]),
    }).toStrictEqual({
      pages: [page(0, ["a"], 5), page(1, ["c", "d"], 5), page(3, ["e"], 5)],
      nextOffset: 4,
    });
  });
});
