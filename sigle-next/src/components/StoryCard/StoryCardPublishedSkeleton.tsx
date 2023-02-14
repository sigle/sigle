import { pulse } from '@/ui/animations';
import { styled } from '@sigle/stitches.config';
import { Flex } from '@sigle/ui';

const SkeletonContainer = styled('div', {
  animation: `${pulse} $transitions$animate-pulse`,
});

const Skeleton = styled('div', {
  backgroundColor: '$gray3',
  br: '$md',
  maxWidth: '100%',
});

export const StoryCardPublishedSkeleton = () => {
  return (
    <SkeletonContainer
      css={{
        borderTop: '1px solid $gray6',
        py: '$6',
        '&:first-child': {
          borderTop: 'none',
        },
      }}
    >
      <Skeleton css={{ height: 16, width: 130 }} />
      <Flex mt="3">
        <Skeleton css={{ height: 26, width: 500 }} />
      </Flex>
      <Flex mt="2" gap="1" direction="column">
        <Skeleton css={{ height: 16, width: '100%' }} />
        <Skeleton css={{ height: 16, width: '100%' }} />
        <Skeleton css={{ height: 16, width: '100%' }} />
      </Flex>
      <Flex mt="6" gap="2" align="center">
        <Skeleton css={{ height: 24, width: 24, br: '$xs' }} />
        <Skeleton css={{ height: 16, width: 80 }} />
        <Skeleton css={{ height: 16, width: 80 }} />
      </Flex>
    </SkeletonContainer>
  );
};
