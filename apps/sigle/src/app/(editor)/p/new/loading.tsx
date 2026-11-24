import { Skeleton } from "@/components/ui/skeleton";

// Follows the layout of the editor, see EditorHeader, EditorTitle and
// EditorCoverImage.
export const PageEditorSkeleton = () => {
  return (
    <>
      <div className="flex h-14 items-center justify-between border-b border-border px-4 md:px-6">
        <Skeleton className="h-4 w-16" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-5" />
          <Skeleton className="h-7 w-16" />
        </div>
      </div>
      <div className="mx-auto max-w-2xl">
        <Skeleton className="mt-12 h-12 w-2/3 md:mt-16 md:h-14" />
        <Skeleton className="mt-4 h-9 w-44" />
        <div className="mt-8 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </>
  );
};

export default function Loading() {
  return <PageEditorSkeleton />;
}
