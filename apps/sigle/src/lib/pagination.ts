/** How many items a list loads at once, initially and on "Load more". */
export const PAGE_SIZE = 20;

interface OffsetPage<Item> {
  readonly results: ReadonlyArray<Item>;
  readonly offset: number;
  readonly total: number;
}

/**
 * The offset of the page after `page`, or `undefined` once the list has no
 * more items. A page emptied by removing its items still continues while
 * items remain after it.
 */
export const getNextOffset = (page: OffsetPage<unknown>) => {
  const nextOffset = page.offset + page.results.length;

  return nextOffset < page.total ? nextOffset : undefined;
};

/**
 * The loaded pages without the item `id`, paged the way the server now pages
 * the list: the items after it move up by one, so the next page still starts
 * right after the last loaded item. Pages can overlap after an item is added,
 * so the item is removed from each of them.
 */
export const removeFromPages = <
  Page extends OffsetPage<{ readonly id: string }>,
>(
  pages: ReadonlyArray<Page>,
  id: string,
): Array<Page> => {
  const index = pages.findIndex((page) =>
    page.results.some((item) => item.id === id),
  );

  return index === -1
    ? [...pages]
    : pages.map((page, pageIndex) => ({
        ...page,
        results: page.results.filter((item) => item.id !== id),
        offset: pageIndex > index ? page.offset - 1 : page.offset,
        total: page.total - 1,
      }));
};

/**
 * The items of all loaded pages, in order and once each: when an item is
 * added meanwhile, the next page repeats the last item of the previous one.
 */
export const flattenPages = <Item extends { readonly id: string }>(
  pages: ReadonlyArray<OffsetPage<Item>>,
) => [
  ...new Map(
    pages.flatMap((page) => page.results).map((item) => [item.id, item]),
  ).values(),
];
