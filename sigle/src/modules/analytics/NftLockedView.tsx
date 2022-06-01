import Image from 'next/image';
import { sigleConfig } from '../../config';
import { Box, Button, Flex, Heading, Text, Typography } from '../../ui';
import { DashboardLayout } from '../layout';

export const NftLockedView = () => {
  return (
    <DashboardLayout>
      <Box
        css={{
          display: 'grid',
          placeItems: 'center',

          '@xl': {
            height: '100%',
          },
        }}
      >
        <Flex gap="5" direction="column" align="center">
          <Box css={{ position: 'relative' }}>
            <Image width={144} height={131} src="/static/img/nft_locked.gif" />
          </Box>
          <Typography as="h3" size="h3">
            ✨ Creator plan ✨
          </Typography>
          <Typography css={{ textAlign: 'center' }} size="subheading">
            Do more with Sigle and access premium features for your Web3 blog
          </Typography>
          <Flex
            as="ul"
            css={{
              backgroundColor: '$green2',
              br: '$2',
              color: '$green12',
              py: '$5',
              px: '$10',
            }}
            direction="column"
            gap="3"
          >
            <Typography size="subheading" as="li">
              <span>✅</span> Analytics page
            </Typography>
            <Typography size="subheading" as="li">
              <span>⚙️</span> Newsletters
            </Typography>
            <Typography size="subheading" as="li">
              <span>⚙️</span> Monetisation (write & earn)
            </Typography>
            <Typography size="subheading" as="li">
              <span>⚙️</span> Publish on Discover page
            </Typography>
            <Typography size="subheading" as="li">
              <span>⚙️</span> Domain name
            </Typography>
            <Typography size="subheading" as="li">
              <span>⚙️</span> And more...
            </Typography>
          </Flex>
          <Flex direction="column">
            <Typography
              size="subheading"
              css={{ textAlign: 'center', mb: '$2' }}
            >
              Unlock the creator plan with your Explorer Guild NFT
            </Typography>
            <Button
              as="a"
              href={sigleConfig.gammaUrl}
              target="_blank"
              rel="noreferrer"
              size="lg"
              css={{
                alignSelf: 'center',
              }}
            >
              Get the NFT
            </Button>
          </Flex>
        </Flex>
      </Box>
    </DashboardLayout>
  );
};
