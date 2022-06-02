import { Box, Button, Flex, Typography } from '../../../ui';
import { SettingsLayout } from '../SettingsLayout';

export const CurrentPlan = () => {
  return (
    <SettingsLayout>
      <Flex align="center" justify="between">
        <Typography size="h4" css={{ fontWeight: 600 }}>
          Current plan
        </Typography>
        <Button disabled color="orange">
          Upgrade (coming soon)
        </Button>
      </Flex>

      <Box css={{ mt: '$2', borderRadius: '$3', border: '1px solid $gray7' }}>
        <Box
          css={{
            background: '$gray2',
            borderBottom: '1px solid $gray7',
            padding: '$3',
            borderTopLeftRadius: '$3',
            borderTopRightRadius: '$3',
          }}
        >
          <Flex direction="column" gap="1">
            <Typography size="h4" css={{ fontWeight: 600 }}>
              You’re a Starter member!
            </Typography>
            <Typography size="subheading">
              All the basics for casual writers
            </Typography>
          </Flex>
        </Box>
        <Flex gap="2" direction="column" css={{ padding: '$3' }}>
          <Typography size="subheading">
            <Box as="span" css={{ marginRight: '$2' }}>
              ✅
            </Box>
            Write unlimited stories
          </Typography>
          <Typography size="subheading">
            <Box as="span" css={{ marginRight: '$2' }}>
              ✅
            </Box>
            Data stored on Gaïa
          </Typography>
          <Typography size="subheading">
            <Box as="span" css={{ marginRight: '$2' }}>
              ⚙️
            </Box>
            Monetise your stories
          </Typography>
          <Typography size="subheading">
            <Box as="span" css={{ marginRight: '$2' }}>
              ⚙️
            </Box>
            Send newsletters
          </Typography>
        </Flex>
      </Box>
    </SettingsLayout>
  );
};
