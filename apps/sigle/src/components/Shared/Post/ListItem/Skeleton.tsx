import { Skeleton } from "@/components/ui/skeleton";

export const PostListItemSkeleton = () => (
  <li className="border-b border-border py-6">
    <Skeleton className="h-6 w-2/3" />
    <Skeleton className="mt-3 h-4 w-full" />
    <Skeleton className="mt-3 h-3 w-24" />
  </li>
);
