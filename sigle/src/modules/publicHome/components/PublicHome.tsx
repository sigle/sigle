import React, { useState } from 'react';
import { NextSeo } from 'next-seo';
import Image from 'next/image';
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
  IconButton,
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
  useGetUsersFollowers,
  useGetUsersFollowing,
} from '../../../hooks/users';
import { UserCard } from '../../userCard/UserCard';
import { DashboardLayout } from '../../layout';
import { AppHeader } from '../../layout/components/AppHeader';
import { useRouter } from 'next/router';
import { GlobeIcon, Pencil1Icon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { TwitterFilledIcon } from '../../../icons';
import { EnvelopePlusIcon } from '../../../icons/EnvelopPlusIcon';
import { SubscribeModal } from '../../subscribeModal/SubscribeModal';
import { StoryCardSkeleton } from '../../home/components/StoryItemSkeleton';
import { useUserControllerGetUser } from '@/__generated__/sigle-api/sigleApiComponents';

const StyledTabsTrigger = styled(TabsTrigger, {
  fontSize: 13,
  '@xl': {
    fontSize: 15,
  },
});

const ExtraInfoLink = styled('a', {
  color: '$gray9',
  fontSize: '$1',

  '&:hover': {
    color: '$gray10',
  },
  '&:active': {
    color: '$gray12',
  },

  '@md': {
    fontSize: '$2',
  },
});

const StyledContainer = styled(Container, {
  pb: '$15',
  maxWidth: 826,
});

const Header = styled('div', {
  pb: '$8',
  display: 'flex',
  flexDirection: 'column',
  mx: 'auto',

  '@md': {
    maxWidth: 826,
  },
});

const HeaderLogoContainer = styled('div', {
  width: 76,
  height: 76,
  display: 'flex',
  justifyContent: 'center',
  br: '$4',
  overflow: 'hidden',
  mb: '$2',

  '@md': {
    width: 92,
    height: 92,
  },
});

const HeaderLogo = styled('img', {
  width: 'auto',
  height: '100%',
  maxWidth: 76,
  maxHeight: 76,
  objectFit: 'cover',

  '@md': {
    maxWidth: 92,
    maxHeight: 92,
  },
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
      <Box
        css={{
          display: 'block',
          '@md': {
            display: 'none',
          },
        }}
        as="span"
      >
        <GlobeIcon />
      </Box>
      <Box
        css={{
          display: 'none',
          '@md': {
            display: ' block',
          },
        }}
        as="span"
      >
        {displayUrl}
      </Box>
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
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const router = useRouter();
  const { data: userInfoByAddress } = useUserControllerGetUser({
    pathParams: {
      userAddress: userInfo.address,
    },
  });
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

  const seoImage =
    settings.siteLogo &&
    encodeURI(settings.siteLogo).replace('(', '%28').replace(')', '%29');

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
      { shallow: true },
    );
  };

  const handleShowSubscribe = () => setShowSubscribeDialog(true);

  const handleCancelSubscribe = () => setShowSubscribeDialog(false);

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
            px: userInfo.username !== user?.username ? '$5' : 0,
          }}
        >
          <Flex
            css={{ mb: '$2', width: '100%' }}
            align="start"
            justify="between"
          >
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
              <Flex gap="3">
                {!isFollowingUser ? (
                  <Button
                    color="orange"
                    css={{ ml: '$5' }}
                    onClick={handleFollow}
                  >
                    Follow
                  </Button>
                ) : (
                  <Button
                    color="orange"
                    variant="outline"
                    css={{ ml: '$5' }}
                    onClick={handleUnfollow}
                  >
                    Unfollow
                  </Button>
                )}
                {userInfoByAddress?.newsletter && (
                  <IconButton
                    color="orange"
                    variant="solid"
                    onClick={handleShowSubscribe}
                  >
                    <EnvelopePlusIcon />
                  </IconButton>
                )}

                <SubscribeModal
                  userInfo={{
                    address: userInfo.address,
                    siteName,
                    siteLogo: settings.siteLogo
                      ? settings.siteLogo
                      : generateAvatar(userInfo.address),
                  }}
                  open={showSubscribeDialog}
                  onClose={handleCancelSubscribe}
                />
              </Flex>
            ) : null}
            {user && user.username === userInfo.username && (
              <Link href="/settings" passHref legacyBehavior>
                <Button size="sm" as="a" css={{ gap: '$2' }} variant="subtle">
                  Edit profile
                  <Pencil1Icon />
                </Button>
              </Link>
            )}
          </Flex>
          <Flex
            css={{
              mb: '$3',

              '@md': {
                mb: '$1',
              },
            }}
            direction={{
              '@initial': 'column',
              '@md': 'row',
            }}
            align={{
              '@initial': 'start',
              '@md': 'center',
            }}
            gap="1"
          >
            <Typography
              css={{
                fontWeight: 700,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 360,

                '@md': {
                  maxWidth: '100%',
                  whiteSpace: 'normal',
                  overflow: 'initial',
                  textOverflow: 'initial',
                },
              }}
              as="h1"
              size={{
                '@initial': 'h4',
                '@md': 'h2',
              }}
            >
              {siteName}
            </Typography>
            <Flex gap="3" align="center">
              <Typography
                size="subheading"
                css={{
                  backgroundColor: '$gray4',
                  py: '$1',
                  px: '$3',
                  br: '$2',
                }}
              >
                {userInfo.username}
              </Typography>
              {userInfoByAddress?.subscription && (
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>
                  <TooltipContent
                    css={{ boxShadow: 'none' }}
                    side="right"
                    sideOffset={8}
                  >
                    Explorer holder
                  </TooltipContent>
                </Tooltip>
              )}
            </Flex>
          </Flex>
          <Flex gap="3" align="center">
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
                <Box
                  css={{
                    display: 'block',
                    '@md': {
                      display: 'none',
                    },
                  }}
                  as="span"
                >
                  <TwitterFilledIcon />
                </Box>
                <Box
                  css={{
                    display: 'none',
                    '@md': {
                      display: 'block',
                    },
                  }}
                  as="span"
                >
                  {twitterHandle?.includes('@')
                    ? twitterHandle
                    : `@${twitterHandle}`}
                </Box>
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

        <StyledContainer
          css={{
            px: userInfo.username !== user?.username ? '$5' : 0,
          }}
        >
          <Tabs
            onValueChange={(value) => handleTabValueChange(value as ActiveTab)}
            value={router.query.tab ? (router.query.tab as string) : 'stories'}
            defaultValue="stories"
          >
            <TabsList
              css={{ boxShadow: '0 1px 0 0 $colors$gray6', mb: 0 }}
              aria-label="See your stories, other users that you follow, or, other users that follow you."
            >
              <StyledTabsTrigger value="stories">{`Stories (${file.stories.length})`}</StyledTabsTrigger>
              <StyledTabsTrigger value="following">{`Following (${
                userInfoByAddress ? userInfoByAddress.followingCount : 0
              })`}</StyledTabsTrigger>
              <StyledTabsTrigger value="followers">{`Followers (${
                userInfoByAddress ? userInfoByAddress.followersCount : 0
              })`}</StyledTabsTrigger>
            </TabsList>
            <TabsContent value="stories">
              {file.stories.length === 0 && (
                <>
                  {userInfo.username === user?.username ? (
                    <Typography
                      size="subheading"
                      css={{ mt: '$8', textAlign: 'center' }}
                    >
                      No stories yet
                    </Typography>
                  ) : (
                    <Flex
                      css={{ mt: '$10' }}
                      direction="column"
                      gap="5"
                      align="center"
                    >
                      <Typography size="subheading">{`${siteName} has not posted anything yet.`}</Typography>
                      <Typography size="subheading">Come back later</Typography>
                      <StoryCardSkeleton />
                      <StoryCardSkeleton />
                    </Flex>
                  )}
                </>
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
