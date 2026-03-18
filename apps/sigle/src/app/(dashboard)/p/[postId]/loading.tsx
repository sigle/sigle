import { Container, Skeleton } from "@radix-ui/themes";
import { Separator } from "@/components/ui/separator";

export const PagePostSkeleton = () => {
  return (
    <>
      {/* Cover Image */}
      <Container size="3" className="mt-6 px-4">
        <Skeleton className="h-[350px] w-full rounded-2" />
      </Container>

      <Container size="2" className="my-8 px-4 md:my-10">
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
          <h1 className="text-xs font-medium text-pretty">
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
      </Container>
    </>
  );
};

export default PagePostSkeleton;
