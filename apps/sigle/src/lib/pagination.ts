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
 * The loaded pages without the item `id`, paged the way the server now pages
 * the list: the items after it move up by one, so the next page still starts
 * right after the last loaded item.
 */
export const removeFromPages = <
  Page extends OffsetPage<{ readonly id: string }>,
>(
  pages: readonly Page[],
  id: string,
): Page[] => {
  const index = pages.findIndex((page) =>
    page.results.some((item) => item.id === id),
  );

  return index === -1
    ? [...pages]
    : pages.map((page, pageIndex) => ({
        ...page,
        results:
          pageIndex === index
            ? page.results.filter((item) => item.id !== id)
            : page.results,
        offset: pageIndex > index ? page.offset - 1 : page.offset,
        total: page.total - 1,
      }));
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
