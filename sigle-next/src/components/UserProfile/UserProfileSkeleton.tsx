import { styled } from '@sigle/stitches.config';
import { Flex } from '@sigle/ui';
import { pulse } from '@/ui/animations';

const SkeletonContainer = styled('div', {
  animation: `${pulse} $transitions$animate-pulse`,
});

const Skeleton = styled('div', {
  backgroundColor: '$gray3',
  br: '$md',
  maxWidth: '100%',
});

export const UserProfileSkeleton = () => {
  return (
    <SkeletonContainer>
      <Skeleton css={{ height: 72, width: 72, br: '$sm' }} />
      <Flex mt="2">
        <Skeleton css={{ height: 26, width: 200 }} />
      </Flex>
      <Flex mt="3" gap="3">
        <Skeleton css={{ height: 20, width: 85 }} />
        <Skeleton css={{ height: 20, width: 85 }} />
      </Flex>
      <Flex mt="3" direction="column" gap="1">
        <Skeleton css={{ height: 16, width: '100%' }} />
        <Skeleton css={{ height: 16, width: '100%' }} />
        <Skeleton css={{ height: 16, width: '100%' }} />
        <Skeleton css={{ height: 16, width: '100%' }} />
      </Flex>
      <Flex mt="5" gap="3" align="center">
        <Skeleton css={{ height: 20, width: 150 }} />
      </Flex>
    </SkeletonContainer>
  );
};
