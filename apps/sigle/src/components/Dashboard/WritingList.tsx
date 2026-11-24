import { format } from "date-fns";
import { NextLink } from "@/components/Shared/NextLink";
import { Skeleton } from "@/components/ui/skeleton";

interface WritingListItem {
  id: string;
  title: string;
  href: string;
  date: string;
  /** A short mono tag before the date, such as "Hidden". */
  label?: string;
}

interface WritingListProps {
  title: string;
  total: number | undefined;
  action: { label: string; href: string };
  items: WritingListItem[] | undefined;
  isLoading: boolean;
  error: { message: string } | null;
  emptyLabel: string;
}

/** A dashboard section listing drafts or posts as titled rows with a date. */
export const WritingList = ({
  title,
  total,
  action,
  items,
  isLoading,
  error,
  emptyLabel,
}: WritingListProps) => (
  <section>
    <div className="flex items-baseline justify-between gap-4">
      <h3 className="headline text-2xl">
        {title}
        {total ? (
          <span className="ml-2 font-mono text-sm font-normal tracking-normal text-muted-foreground">
            {total}
          </span>
        ) : null}
      </h3>
      <NextLink
        href={action.href}
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        {action.label}
      </NextLink>
    </div>

    <ul className="mt-4 border-t border-border">
      {isLoading
        ? [0, 1].map((index) => (
            <li key={index} className="border-b border-border py-4">
              <Skeleton className="h-6 w-2/3" />
            </li>
          ))
        : null}

      {error ? (
        <li className="border-b border-border py-4 text-sm text-destructive">
          An error occurred, please try again later. {error.message}
        </li>
      ) : null}

      {items?.length === 0 ? (
        <li className="border-b border-border py-4 text-sm text-muted-foreground">
          {emptyLabel}
        </li>
      ) : null}

      {items?.map((item) => (
        <li key={item.id} className="border-b border-border">
          <NextLink
            href={item.href}
            className="group flex items-baseline justify-between gap-6 py-4"
          >
            <span className="line-clamp-1 headline text-lg underline-offset-4 group-hover:underline">
              {item.title || (
                <span className="text-muted-foreground">Untitled</span>
              )}
            </span>
            <span className="flex shrink-0 items-baseline gap-3 font-mono text-xs text-muted-foreground uppercase">
              {item.label ? (
                <span className="rounded-sm border border-border px-1.5 text-[0.65rem] tracking-wide">
                  {item.label}
                </span>
              ) : null}
              <time dateTime={item.date}>
                {format(new Date(item.date), "MMM d")}
              </time>
            </span>
          </NextLink>
        </li>
      ))}
    </ul>
  </section>
);
