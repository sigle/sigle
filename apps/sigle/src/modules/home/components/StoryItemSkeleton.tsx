import { Box, Flex } from '../../../ui';

export const StoryCardSkeleton = () => (
  <Flex
    css={{
      display: 'none',

      '@lg': {
        display: 'flex',
        gap: '$7',
        p: '$7',
      },
    }}
  >
    <Box
      css={{ width: 180, height: 130, backgroundColor: '$gray2', br: '$1' }}
    />
    <Flex direction="column" justify="between">
      <Flex direction="column" gap="2">
        <Box
          css={{
            width: 350,
            height: 20,
            backgroundColor: '$gray2',
            br: '$1',
          }}
        />
        <Box
          css={{
            width: 150,
            height: 20,
            backgroundColor: '$gray2',
            br: '$1',
          }}
        />
      </Flex>
      <Flex direction="column" gap="2">
        <Box
          css={{
            width: 600,
            height: 20,
            backgroundColor: '$gray2',
            br: '$1',
          }}
        />
        <Box
          css={{
            width: 500,
            height: 20,
            backgroundColor: '$gray2',
            br: '$1',
          }}
        />
      </Flex>
    </Flex>
  </Flex>
);
