import { Skeleton, Text } from '@radix-ui/themes';

export const PostListItemSkeleton = () => {
  return (
    <div className="space-y-3 border-b border-solid border-gray-6 py-5 last:border-b-0">
      {/* Date at the top */}
      <Skeleton className="w-full max-w-[80px]">
        <Text size="1" as="div">
          &#8203;
        </Text>
      </Skeleton>

      {/* Avatar */}
      <div className="flex items-center space-x-1">
        <Skeleton className="size-6 rounded-3" />
        <Skeleton className="w-full max-w-[180px]">
          <Text size="1" as="div">
            &#8203;
          </Text>
        </Skeleton>
      </div>

      {/* Title and content on 3 lines */}
      <Skeleton className="w-full">
        <Text size="4" as="div">
          &#8203;
          <br />
          &#8203;
          <br />
          &#8203;
        </Text>
      </Skeleton>

      {/* Actions */}
      <Skeleton className="w-full max-w-[140px]">
        <Text size="3" as="div">
          &#8203;
        </Text>
      </Skeleton>
    </div>
  );
};
