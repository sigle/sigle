import { describe, expect, it } from "vite-plus/test";
import { flattenPages, getNextOffset, removeFromPages } from "./pagination";

const page = (offset: number, ids: Array<string>, total: number) => ({
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
      nextOffset: getNextOffset(pages.at(-1)!),
    }).toStrictEqual({
      pages: [page(0, ["a"], 5), page(1, ["c", "d"], 5), page(3, ["e"], 5)],
      nextOffset: 4,
    });
  });

  it("removes the item from pages that overlap after an item was added", () => {
    // “new” was published between the two loads, so “b” is on both pages.
    const pages = removeFromPages(
      [page(0, ["a", "b"], 3), page(2, ["b", "c"], 4)],
      "b",
    );

    expect(flattenPages(pages).map((item) => item.id)).toStrictEqual([
      "a",
      "c",
    ]);
  });

  it("keeps loading after a page loses all its items", () => {
    const pages = removeFromPages([page(0, ["a"], 2)], "a");

    expect(getNextOffset(pages[0])).toBe(0);
  });
});
