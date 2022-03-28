import {
  DiscordLogoIcon,
  GitHubLogoIcon,
  TwitterLogoIcon,
} from '@radix-ui/react-icons';
import { sigleConfig } from '../../../config';
import { styled } from '../../../stitches.config';
import { Flex, IconButton, Text } from '../../../ui';

export const Footer = styled('footer', {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  pt: '$6',
  boxShadow: ' 0 0 0 1px $colors$gray6',
});

export const AppFooter = () => {
  return (
    <Footer>
      <Flex css={{ mb: '$5' }} gap="3">
        <IconButton
          as="a"
          href={sigleConfig.twitterUrl}
          target="_blank"
          rel="noreferrer"
        >
          <TwitterLogoIcon />
        </IconButton>
        <IconButton
          as="a"
          href={sigleConfig.discordUrl}
          target="_blank"
          rel="noreferrer"
        >
          <DiscordLogoIcon />
        </IconButton>
        <IconButton
          as="a"
          href={sigleConfig.githubUrl}
          target="_blank"
          rel="noreferrer"
        >
          <GitHubLogoIcon />
        </IconButton>
      </Flex>
      <Flex
        css={{
          flexDirection: 'column',
          boxShadow: '0 1px 0 0 $colors$gray6',
          pb: '$3',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',

          '@md': {
            flexDirection: 'row',
          },
        }}
        gap="5"
      >
        <Text
          size="sm"
          as="a"
          target="_blank"
          rel="noreferrer"
          href={sigleConfig.blogUrl}
          css={{
            color: '$gray12',
            '&:hover': {
              boxShadow: '0 1px 0 0px $colors$gray12',
            },
          }}
        >
          Blog
        </Text>
        <Text
          size="sm"
          as="a"
          target="_blank"
          rel="noreferrer"
          href={sigleConfig.documentationUrl}
          css={{
            color: '$gray12',
            '&:hover': {
              boxShadow: '0 1px 0 0px $colors$gray12',
            },
          }}
        >
          Documentation
        </Text>
        <Text
          size="sm"
          as="a"
          target="_blank"
          rel="noreferrer"
          href={sigleConfig.discordUrl}
          css={{
            color: '$gray12',
            '&:hover': {
              boxShadow: '0 1px 0 0px $colors$gray12',
            },
          }}
        >
          Support
        </Text>
        <Text
          size="sm"
          as="a"
          target="_blank"
          rel="noreferrer"
          href={sigleConfig.feedbackUrl}
          css={{
            color: '$gray12',
            '&:hover': {
              boxShadow: '0 1px 0 0px $colors$gray12',
            },
          }}
        >
          Feedback
        </Text>
      </Flex>
      <Text
        size="xs"
        css={{
          py: '$5',
          color: '$gray12',
        }}
      >
        © Sigle {new Date().getFullYear()}
      </Text>
    </Footer>
  );
};
