import { Skeleton } from "@/components/ui/skeleton";

export const PostListItemSkeleton = () => {
  return (
    <div className="space-y-3 border-b border-solid border-border py-5 last:border-b-0">
      {/* Date at the top */}
      <Skeleton className="w-full max-w-[80px]">
        <div className="text-xs">&#8203;</div>
      </Skeleton>

      {/* Avatar */}
      <div className="flex items-center space-x-1">
        <Skeleton className="size-6 rounded-3" />
        <Skeleton className="w-full max-w-[180px]">
          <div className="text-xs">&#8203;</div>
        </Skeleton>
      </div>

      {/* Title and content on 3 lines */}
      <Skeleton className="w-full">
        <div className="text-lg">
          &#8203;
          <br />
          &#8203;
          <br />
          &#8203;
        </div>
      </Skeleton>

      {/* Actions */}
      <Skeleton className="w-full max-w-[140px]">
        <div className="text-base">&#8203;</div>
      </Skeleton>
    </div>
  );
};
