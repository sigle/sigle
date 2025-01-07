import { Container, Skeleton, Text } from '@radix-ui/themes';

export const PageEditorSkeleton = () => {
  return (
    <>
      {/* Header */}
      <div className="flex h-[80px] items-center justify-between border-b border-gray-5 px-6">
        <Skeleton className="size-7" />
        <Skeleton className="h-7 w-20" />
      </div>
      <Container size="2" className="mt-4 mb-4">
        <div className="space-y-4">
          {/* Title */}
          <Skeleton className="h-9 w-2/3" />

          {/* Cover image */}
          <Skeleton className="h-[450px]" />

          {/* Text */}
          <Text as="div" size="1">
            <Skeleton>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </Skeleton>
          </Text>
        </div>
      </Container>
    </>
  );
};

export default function Loading() {
  return <PageEditorSkeleton />;
}
