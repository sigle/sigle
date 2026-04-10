import { Skeleton } from "@/components/ui/skeleton";

export const PageEditorSkeleton = () => {
  return (
    <>
      {/* Header */}
      <div className="flex h-[80px] items-center justify-between border-b border-border px-6">
        <Skeleton className="size-7" />
        <Skeleton className="h-7 w-20" />
      </div>
      <div className="mx-auto my-4 max-w-2xl">
        <div className="space-y-4">
          {/* Title */}
          <Skeleton className="h-9 w-2/3" />

          {/* Cover image */}
          <Skeleton className="h-[450px]" />

          {/* Text */}
          <div className="prose pb-5 lg:prose-lg dark:prose-invert">
            <Skeleton>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </Skeleton>
          </div>
        </div>
      </div>
    </>
  );
};

export default function Loading() {
  return <PageEditorSkeleton />;
}
