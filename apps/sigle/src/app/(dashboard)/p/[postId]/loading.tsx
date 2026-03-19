import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export const PagePostSkeleton = () => {
  return (
    <>
      {/* Cover Image */}
      <div className="mx-auto mt-6 max-w-4xl px-4">
        <Skeleton className="h-[400px] w-full rounded-2" />
      </div>

      <div className="mx-auto my-8 max-w-2xl px-4 md:my-10">
        {/* Back Button */}
        <Skeleton className="mb-6 h-9 w-28" />

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-medium text-pretty">
            <Skeleton>Lorem ipsum dolor sit amet</Skeleton>
          </h1>

          {/* User Actions */}
          <div className="flex gap-4">
            <Skeleton className="h-9 w-24" />
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Content */}
        <div className="space-y-3">
          <Skeleton className="w-full">
            <p className="text-sm">&#8203;</p>
          </Skeleton>
          <Skeleton className="w-full">
            <p className="text-sm">&#8203;</p>
          </Skeleton>
          <Skeleton className="w-full">
            <p className="text-sm">&#8203;</p>
          </Skeleton>
          <Skeleton className="w-3/4">
            <p className="text-sm">&#8203;</p>
          </Skeleton>
        </div>
      </div>
    </>
  );
};

export default PagePostSkeleton;
