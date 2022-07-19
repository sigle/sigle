import {
  GitHubLogoIcon,
  TwitterLogoIcon,
  DiscordLogoIcon,
  SunIcon,
} from '@radix-ui/react-icons';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { styled } from '../../../stitches.config';
import { Box, Button, Container, Flex, IconButton } from '../../../ui';
import { useAuth } from '../../auth/AuthContext';
import { sigleConfig } from '../../../config';
import { useGetUserMe } from '../../../hooks/users';
import { useFeatureFlags } from '../../../utils/featureFlags';
import { HeaderDropdown } from './HeaderDropdown';

const Header = styled('header', Container, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  mt: '$4',
  width: '100%',

  '@md': {
    mt: '$10',
  },
});

export const AppHeader = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, isLegacy } = useAuth();
  const { status } = useSession();
  const { isExperimentalFollowEnabled } = useFeatureFlags();

  /**
   * This query is used to register the user in the DB. As the header is part of all the
   * pages we know this query will run before any operation.
   */
  useGetUserMe({
    enabled: status === 'authenticated',
    staleTime: 0,
    refetchOnMount: false,
  });

  const toggleTheme = () => {
    resolvedTheme === 'dark' ? setTheme('light') : setTheme('dark');
  };

  let src;

  switch (resolvedTheme) {
    case 'dark':
      src = '/static/img/logo_white.png';
      break;
    default:
      src = '/static/img/logo.png';
      break;
  }

  return (
    <Header>
      <Flex
        css={{ width: '100%', '@md': { width: 'auto' } }}
        justify="between"
        gap="10"
        as="nav"
        align="center"
      >
        <Link href="/[username]" as={`/`} passHref>
          <Flex as="a" css={{ '@lg': { display: 'none' } }}>
            <Image
              width={93}
              height={34}
              objectFit="cover"
              src={src}
              alt="logo"
            />
          </Flex>
        </Link>

        <Link href="/" passHref>
          <Box as="a" css={{ display: 'none', '@lg': { display: 'flex' } }}>
            <Image
              width={93}
              height={34}
              objectFit="cover"
              src={src}
              alt="logo"
            />
          </Box>
        </Link>
      </Flex>
      <Flex
        css={{
          display: 'none',
          '@md': {
            display: 'flex',
          },
        }}
        align="center"
        gap="9"
      >
        {isExperimentalFollowEnabled && user && !isLegacy ? (
          <Link href="/feed" passHref>
            <Button variant="ghost" as="a">
              Feed
            </Button>
          </Link>
        ) : null}
        {user ? (
          <HeaderDropdown />
        ) : (
          <Flex gap="6">
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
        )}
        {!user && (
          <>
            <Link href="/" passHref>
              <Button as="a" size="lg">
                Enter App
              </Button>
            </Link>
            <IconButton as="button" onClick={toggleTheme}>
              <SunIcon />
            </IconButton>
          </>
        )}
      </Flex>
    </Header>
  );
};
