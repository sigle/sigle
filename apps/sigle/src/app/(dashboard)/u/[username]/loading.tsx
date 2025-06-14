import { ProfileFeedSkeleton } from "@/components/User/ProfileFeed";
import { Avatar, Container, Heading, Skeleton, Text } from "@radix-ui/themes";

export const PageProfileSkeleton = () => {
  return (
    <>
      {/* Banner */}
      <Skeleton>
        <div className="h-64 md:h-[22rem]" />
      </Skeleton>

      <Container size="2" px="4">
        {/* Profile image */}
        <div className="flex">
          <div className="z-10 mt-[-70px] rounded-5 border-[6px] border-transparent bg-white dark:bg-gray-1">
            <Skeleton>
              <Avatar fallback={"L"} size="8" radius="small" />
            </Skeleton>
          </div>
        </div>

        {/* Profile name */}
        <div className="mt-4 space-y-1">
          <Heading size="6">
            <Skeleton>username username</Skeleton>
          </Heading>
          <Text as="p" color="gray" size="2">
            <Skeleton>loremipsum</Skeleton>
          </Text>
        </div>

        {/* Followers info */}
        <div className="mt-4 flex gap-2">
          <Text as="p" size="2">
            <Skeleton>x Following</Skeleton>
          </Text>
          <Text as="p" size="2">
            <Skeleton>x followers</Skeleton>
          </Text>
        </div>

        {/* Bio */}
        <Text mt="3" as="p" color="gray" size="2">
          <Skeleton>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </Skeleton>
        </Text>

        <div className="pt-10 pb-20">
          <ProfileFeedSkeleton />
        </div>
      </Container>
    </>
  );
};

export default function Loading() {
  return <PageProfileSkeleton />;
}
