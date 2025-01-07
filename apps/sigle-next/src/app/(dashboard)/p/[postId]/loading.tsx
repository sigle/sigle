import { Container, Heading, Skeleton, Text } from '@radix-ui/themes';

export const PagePostSkeleton = () => {
  return (
    <Container size="2" className="mt-20 pb-10 px-4">
      {/* Title */}
      <Heading size="8">
        <Skeleton>Lorem ipsum dolor sit amet</Skeleton>
      </Heading>

      {/* Avatar */}
      <div className="mt-5 flex items-center space-x-1">
        <Skeleton className="size-12 rounded-3" />
        <div className="space-y-2">
          <Skeleton className="w-[160px]">
            <Text as="div" size="1">
              &#8203;
            </Text>
          </Skeleton>
          <Skeleton className="w-[80px]">
            <Text as="div" size="1">
              &#8203;
            </Text>
          </Skeleton>
        </div>
      </div>

      {/* Image */}
      <Skeleton className="mt-10 h-[350px] w-full" />

      {/* Text */}
      <div className="mt-10 space-y-2">
        <Skeleton className="w-full">
          <Text as="div" size="1">
            &#8203;
          </Text>
        </Skeleton>
        <Skeleton className="w-full">
          <Text as="div" size="1">
            &#8203;
          </Text>
        </Skeleton>
        <Skeleton className="w-full">
          <Text as="div" size="1">
            &#8203;
          </Text>
        </Skeleton>
      </div>
    </Container>
  );
};

export default PagePostSkeleton;
