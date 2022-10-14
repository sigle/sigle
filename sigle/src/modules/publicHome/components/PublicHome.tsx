import React from 'react';
import { NextSeo } from 'next-seo';
import Image from 'next/future/image';
import { useTheme } from 'next-themes';
import { StoryFile, SettingsFile } from '../../../types';
import { PoweredBy } from '../../publicStory/PoweredBy';
import {
  Box,
  Button,
  Container,
  Flex,
  Tabs,
  TabsTrigger,
  TabsContent,
  TabsList,
  Typography,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '../../../ui';
import { sigleConfig } from '../../../config';
import { styled } from '../../../stitches.config';
import { useAuth } from '../../auth/AuthContext';
import {
  useGetGaiaUserFollowing,
  useUserFollow,
  useUserUnfollow,
} from '../../../hooks/appData';
import { generateAvatar } from '../../../utils/boringAvatar';
import { StoryCard } from '../../storyCard/StoryCard';
import {
  useGetUserByAddress,
  useGetUsersFollowers,
  useGetUsersFollowing,
} from '../../../hooks/users';
import { UserCard } from '../../userCard/UserCard';
import { DashboardLayout } from '../../layout';
import { AppHeader } from '../../layout/components/AppHeader';
import { useRouter } from 'next/router';
import { Pencil1Icon } from '@radix-ui/react-icons';
import Link from 'next/link';

const ExtraInfoLink = styled('a', {
  color: '$gray9',
  fontSize: '$2',

  '&:hover': {
    color: '$gray10',
  },
  '&:active': {
    color: '$gray12',
  },
});

const StyledContainer = styled(Container, {
  pb: '$15',
  maxWidth: 826,
});

const Header = styled('div', {
  pb: '$10',
  px: '$5',
  maxWidth: 826,
  display: 'flex',
  flexDirection: 'column',
  mx: 'auto',
});

const HeaderLogoContainer = styled('div', {
  width: 92,
  height: 92,
  display: 'flex',
  justifyContent: 'center',
  br: '$4',
  overflow: 'hidden',
  mb: '$2',
});

const HeaderLogo = styled('img', {
  width: 'auto',
  height: '100%',
  maxWidth: 92,
  maxHeight: 92,
  objectFit: 'cover',
});

const abbreviateAddress = (address: string) => {
  if (!address) return address;
  const firstFour = address.substring(0, 4);
  const lastFour = address.substring(address.length - 4);
  return `${firstFour}...${lastFour}`;
};

const PublicHomeSiteUrl = ({ siteUrl }: { siteUrl: string }) => {
  let displayUrl = siteUrl;
  let fullUrl = siteUrl;
  if (siteUrl.startsWith('http://') || siteUrl.startsWith('https://')) {
    // We strip http | https from the string for better display
    displayUrl = siteUrl.replace(/^https?:\/\//, '');
  } else {
    // We prefix with https:// to make sure it's a valid URL
    fullUrl = `https://${siteUrl}`;
  }

  return (
    <ExtraInfoLink href={fullUrl} target="_blank" rel="noreferrer">
      {displayUrl}
    </ExtraInfoLink>
  );
};

type ActiveTab = 'stories' | 'following' | 'followers';

interface PublicHomeProps {
  file: StoryFile;
  settings: SettingsFile;
  userInfo: { username: string; address: string };
}

export const PublicHome = ({ file, settings, userInfo }: PublicHomeProps) => {
  const { resolvedTheme } = useTheme();
  const { user, isLegacy } = useAuth();
  const router = useRouter();
  const { data: userInfoByAddress } = useGetUserByAddress(userInfo.address);
  const { data: userFollowing } = useGetGaiaUserFollowing({
    enabled: !!user && userInfo.username !== user.username,
  });
  const { mutate: followUser } = useUserFollow();
  const { mutate: unfollowUser } = useUserUnfollow();
  const { data: following } = useGetUsersFollowing(userInfo.address, {
    enabled: router.query.tab === 'following',
  });
  const { data: followers } = useGetUsersFollowers(userInfo.address, {
    enabled: router.query.tab === 'followers',
  });

  const twitterHandle = settings.siteTwitterHandle;
  const isFollowingUser =
    userFollowing && !!userFollowing.following[userInfo.address];

  const handleFollow = async () => {
    if (!userFollowing) return;
    followUser({ userFollowing, address: userInfo.address });
  };

  const handleUnfollow = async () => {
    if (!userFollowing) {
      return;
    }
    unfollowUser({ userFollowing, address: userInfo.address });
  };

  const featuredStoryIndex = file.stories.findIndex((story) => story.featured);
  const stories = [...file.stories];
  if (featuredStoryIndex !== -1) {
    stories.splice(featuredStoryIndex, 1);
  }

  const userAddress =
    user?.profile.stxAddress.mainnet || user?.profile.stxAddress;

  const siteName = settings.siteName || userInfo.username;

  const seoUrl = `${sigleConfig.appUrl}/${userInfo.username}`;
  const seoTitle = `${siteName} - Sigle`;
  const seoDescription =
    settings.siteDescription?.substring(0, 300) ||
    `Read stories from ${siteName} on Sigle, decentralised and open-source platform for Web3 writers`;
  const seoImage = settings.siteLogo;

  const Layout =
    userInfo.username !== user?.username ? React.Fragment : DashboardLayout;

  const handleTabValueChange = (value: ActiveTab) => {
    if (!value) {
      return;
    }

    router.replace(
      {
        query: { ...router.query, tab: value },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <React.Fragment>
      <NextSeo
        title={seoTitle}
        description={seoDescription}
        openGraph={{
          type: 'website',
          url: seoUrl,
          title: seoTitle,
          description: seoDescription,
          images: [
            {
              url: seoImage || generateAvatar(userAddress),
            },
          ],
        }}
        twitter={{
          site: '@sigleapp',
          cardType: 'summary',
        }}
        additionalLinkTags={[
          {
            rel: 'alternate',
            type: 'application/rss+xml',
            // @ts-expect-error title is missing in next-seo
            title: seoTitle,
            href: `${sigleConfig.appUrl}/api/feed/${userInfo.username}`,
          },
        ]}
      />
      <Layout>
        {userInfo.username !== user?.username && <AppHeader />}
        <Header
          css={{
            pt: userInfo.username !== user?.username ? '$10' : 0,
          }}
        >
          <Flex align="start" justify="between">
            <HeaderLogoContainer>
              <HeaderLogo
                src={
                  settings.siteLogo
                    ? settings.siteLogo
                    : generateAvatar(userInfo.address)
                }
                alt={`${siteName} logo`}
              />
            </HeaderLogoContainer>
            {user &&
            user.username !== userInfo.username &&
            !isLegacy &&
            userFollowing ? (
              !isFollowingUser ? (
                <Button
                  color="orange"
                  css={{ ml: '$5' }}
                  onClick={handleFollow}
                >
                  Follow
                </Button>
              ) : (
                <Button
                  variant="subtle"
                  css={{ ml: '$5' }}
                  onClick={handleUnfollow}
                >
                  Unfollow
                </Button>
              )
            ) : null}
            {user && user.username === userInfo.username && (
              <Link href="/settings" passHref>
                <Button as="a" css={{ gap: '$2' }} variant="subtle">
                  Edit profile
                  <Pencil1Icon />
                </Button>
              </Link>
            )}
          </Flex>
          <Flex align="center" gap="3">
            <Typography css={{ fontWeight: 700 }} as="h1" size="h2">
              {siteName}
            </Typography>
            <Box
              css={{
                backgroundColor: '$gray4',
                py: '$1',
                px: '$3',
                br: '$2',
              }}
            >
              {userInfo.username}
            </Box>
            {userInfoByAddress?.subscription && (
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <a
                    href={`${sigleConfig.gammaUrl}/${userInfoByAddress.subscription.nftId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Image
                      src={
                        resolvedTheme === 'dark'
                          ? '/img/badges/creatorPlusDark.svg'
                          : '/img/badges/creatorPlusLight.svg'
                      }
                      alt="Creator + badge"
                      width={20}
                      height={20}
                    />
                  </a>
                </TooltipTrigger>
                <TooltipContent
                  css={{ boxShadow: 'none' }}
                  side="right"
                  sideOffset={8}
                >
                  Creator + Explorer #{userInfoByAddress.subscription.nftId}
                </TooltipContent>
              </Tooltip>
            )}
          </Flex>
          <Flex css={{ pt: '$3' }} gap="3" align="center">
            {settings.siteUrl && (
              <PublicHomeSiteUrl siteUrl={settings.siteUrl} />
            )}
            {settings.siteUrl && settings.siteTwitterHandle && (
              <Box
                css={{
                  width: '1px',
                  height: '$4',
                  backgroundColor: '$gray9',
                }}
              />
            )}
            {settings.siteTwitterHandle && (
              <ExtraInfoLink
                href={`https://twitter.com/${twitterHandle}`}
                target="_blank"
                rel="noreferrer"
              >
                {twitterHandle?.includes('@')
                  ? twitterHandle
                  : `@${twitterHandle}`}
              </ExtraInfoLink>
            )}
            {settings.siteTwitterHandle && (
              <Box
                css={{
                  width: '1px',
                  height: '$4',
                  backgroundColor: '$gray9',
                }}
              />
            )}
            <Flex
              align="center"
              gap="2"
              css={{
                '&:hover': {
                  '& button': {
                    display: 'block',
                  },
                },
              }}
            >
              <ExtraInfoLink
                href={`https://explorer.stacks.co/address/${userInfo.address}?chain=mainnet`}
                target="_blank"
                rel="noreferrer"
              >
                {abbreviateAddress(userInfo.address)}
              </ExtraInfoLink>
            </Flex>
          </Flex>
          {settings.siteDescription &&
            settings.siteDescription.split('\n').map((text, index) => (
              <Typography size="subheading" css={{ mt: '$2' }} key={index}>
                {text}
              </Typography>
            ))}
        </Header>

        <StyledContainer>
          <Tabs
            onValueChange={(value) => handleTabValueChange(value as ActiveTab)}
            value={router.query.tab ? (router.query.tab as string) : 'stories'}
            defaultValue="stories"
          >
            <TabsList
              css={{ boxShadow: '0 1px 0 0 $colors$gray6', mb: 0 }}
              aria-label="See your stories, other users that you follow, or, other users that follow you."
            >
              <TabsTrigger value="stories">{`Stories (${file.stories.length})`}</TabsTrigger>
              <TabsTrigger value="following">{`Following (${
                userInfoByAddress ? userInfoByAddress.followingCount : 0
              })`}</TabsTrigger>
              <TabsTrigger value="followers">{`Followers (${
                userInfoByAddress ? userInfoByAddress.followersCount : 0
              })`}</TabsTrigger>
            </TabsList>
            <TabsContent value="stories">
              {file.stories.length === 0 && (
                <Typography css={{ mt: '$8', textAlign: 'center' }}>
                  No stories yet
                </Typography>
              )}
              {featuredStoryIndex !== -1 && (
                <StoryCard
                  userInfo={userInfo}
                  story={file.stories[featuredStoryIndex]}
                  settings={settings}
                  featured
                />
              )}
              {stories.map((story) => (
                <StoryCard
                  key={story.id}
                  userInfo={userInfo}
                  story={story}
                  settings={settings}
                />
              ))}
            </TabsContent>

            {router.query.tab === 'following' && (
              <>
                {following?.map((stxAddress) => (
                  <UserCard key={stxAddress} address={stxAddress} />
                ))}
              </>
            )}

            {router.query.tab === 'followers' && (
              <>
                {followers?.map((stxAddress) => (
                  <UserCard key={stxAddress} address={stxAddress} />
                ))}
              </>
            )}
          </Tabs>

          {userInfo.username !== user?.username && <PoweredBy />}
        </StyledContainer>
      </Layout>
    </React.Fragment>
  );
};
