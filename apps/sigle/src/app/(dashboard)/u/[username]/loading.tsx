import { Skeleton } from "@/components/ui/skeleton";
import { ProfileFeedSkeleton } from "@/components/User/ProfileFeed";

// Follows the layout of a profile without a cover, see ProfileHeader and
// ProfileInfo.
export const PageProfileSkeleton = () => {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-20">
      <div className="mt-12 p-1">
        <Skeleton className="size-20" />
      </div>

      <div className="mt-4">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="mt-2 h-3 w-80 max-w-full" />
        <Skeleton className="mt-5 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-3/4" />
        <Skeleton className="mt-5 h-4 w-40" />
      </div>

      <h2 className="mt-12 headline text-2xl">Posts</h2>
      <ProfileFeedSkeleton />
    </div>
  );
};

export default function Loading() {
  return <PageProfileSkeleton />;
}
