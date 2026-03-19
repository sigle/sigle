import { Avatar, Skeleton } from "@radix-ui/themes";
import { ProfileFeedSkeleton } from "@/components/User/ProfileFeed";

export const PageProfileSkeleton = () => {
  return (
    <>
      {/* Banner */}
      <Skeleton>
        <div className="h-64 md:h-88" />
      </Skeleton>

      <div className="mx-auto max-w-2xl px-4">
        {/* Profile image */}
        <div className="flex">
          <div className="z-10 mt-[-70px] rounded-5 border-[6px] border-transparent bg-white dark:bg-gray-1">
            <Skeleton>
              <Avatar fallback="L" size="8" radius="small" />
            </Skeleton>
          </div>
        </div>

        {/* Profile name */}
        <div className="mt-4 space-y-1">
          <p className="text-lg font-medium">
            <Skeleton>username username</Skeleton>
          </p>
          <p className="text-sm text-muted-foreground">
            <Skeleton>loremipsum</Skeleton>
          </p>
        </div>

        {/* Followers info */}
        <div className="mt-4 flex gap-2">
          <p className="text-sm">
            <Skeleton>x Following</Skeleton>
          </p>
          <p className="text-sm">
            <Skeleton>x followers</Skeleton>
          </p>
        </div>

        {/* Bio */}
        <p className="mt-3 text-sm text-muted-foreground">
          <Skeleton>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </Skeleton>
        </p>

        <div className="pt-10 pb-20">
          <ProfileFeedSkeleton />
        </div>
      </div>
    </>
  );
};

export default function Loading() {
  return <PageProfileSkeleton />;
}
