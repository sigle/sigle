import Image from 'next/legacy/image';
import Link from 'next/link';
import { Box, Button, Flex, Typography } from '../../ui';

export const NftLockedView = () => {
  return (
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
            <span>✅</span> Newsletters
          </Typography>
          <Typography size="subheading" as="li">
            <span>✅</span> Custom domain name
          </Typography>
          <Typography size="subheading" as="li">
            <span>⚙️</span> Monetisation (write & earn)
          </Typography>
          <Typography size="subheading" as="li">
            <span>⚙️</span> Publish on Discover page
          </Typography>
          <Typography size="subheading" as="li">
            <span>⚙️</span> And more...
          </Typography>
        </Flex>
        <Flex direction="column">
          <Typography size="subheading" css={{ textAlign: 'center', mb: '$2' }}>
            Unlock the creator plan with your Explorer Guild NFT
          </Typography>
          <Link href="/settings/plans" passHref legacyBehavior>
            <Button
              as="a"
              size="lg"
              color="orange"
              css={{
                alignSelf: 'center',
              }}
            >
              Upgrade
            </Button>
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
};
