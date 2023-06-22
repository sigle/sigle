import { styled } from '@sigle/stitches.config';
import { Flex } from '@sigle/ui';
import { pulse } from '@/ui/animations';

const SkeletonContainer = styled('div', {
  variants: {
    animate: {
      true: {
        animation: `${pulse} $transitions$animate-pulse`,
      },
      false: {
        animation: 'none',
      },
    },
  },
});

const Skeleton = styled('div', {
  backgroundColor: '$gray3',
  br: '$md',
  maxWidth: '100%',
});

interface StoryCardPublishedSkeletonProps {
  animate?: boolean;
}

export const StoryCardPublishedSkeleton = ({
  animate,
}: StoryCardPublishedSkeletonProps) => {
  return (
    <SkeletonContainer
      animate={animate}
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
        <Skeleton css={{ height: 26, width: '60%' }} />
      </Flex>
      <Flex mt="2" css={{ gap: 7 }} direction="column">
        <Skeleton css={{ height: 14, width: '100%' }} />
        <Skeleton css={{ height: 14, width: '100%' }} />
        <Skeleton css={{ height: 14, width: '70%' }} />
      </Flex>
      <Flex mt="6" gap="2" align="center">
        <Skeleton css={{ height: 24, width: 24, br: '$xs' }} />
        <Skeleton css={{ height: 16, width: 80 }} />
        <Skeleton css={{ height: 16, width: 80 }} />
      </Flex>
    </SkeletonContainer>
  );
};
