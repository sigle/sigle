/** How many items a list loads at once, initially and on "Load more". */
export const PAGE_SIZE = 20;

interface OffsetPage<Item> {
  readonly results: readonly Item[];
  readonly offset: number;
  readonly total: number;
}

/**
 * The offset of the page after `page`, or `undefined` once the list has no
 * more items. An empty page also ends the list, so items deleted meanwhile
 * can't make it request the same offset forever.
 */
export const getNextOffset = (page: OffsetPage<unknown>) => {
  const nextOffset = page.offset + page.results.length;

  return page.results.length > 0 && nextOffset < page.total
    ? nextOffset
    : undefined;
};

/**
 * The items of all loaded pages, in order and once each: when an item is
 * added meanwhile, the next page repeats the last item of the previous one.
 */
export const flattenPages = <Item extends { readonly id: string }>(
  pages: readonly OffsetPage<Item>[],
) => [
  ...new Map(
    pages.flatMap((page) => page.results).map((item) => [item.id, item]),
  ).values(),
];
