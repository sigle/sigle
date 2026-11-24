import { Button } from "@/components/ui/button";

interface LoadMoreProps {
  readonly shown: number;
  readonly total: number;
  readonly loading: boolean;
  readonly onLoadMore: () => void;
}

/** The row under a list that loads its next page. */
export const LoadMore = ({
  shown,
  total,
  loading,
  onLoadMore,
}: LoadMoreProps) => (
  <div className="flex flex-col items-center gap-3 pt-8">
    <Button variant="outline" loading={loading} onClick={onLoadMore}>
      Load more
    </Button>
    <p className="font-mono text-xs text-muted-foreground">
      {shown} of {total}
    </p>
  </div>
);
