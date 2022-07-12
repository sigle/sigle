import React from 'react';
import { NextSeo } from 'next-seo';
import Image from 'next/future/image';
import { StoryFile, SettingsFile } from '../../../types';
import { PoweredBy } from '../../publicStory/PoweredBy';
import { AppHeader } from '../../layout/components/AppHeader';
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
  useGetUserFollowing,
  useUserFollow,
  useUserUnfollow,
} from '../../../hooks/appData';
import { generateAvatar } from '../../../utils/boringAvatar';
import { useFeatureFlags } from '../../../utils/featureFlags';
import { StoryCard } from '../../storyCard/StoryCard';
import { useTheme } from 'next-themes';

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
  py: '$10',
  px: '$4',
  maxWidth: 826,
  display: 'flex',
  flexDirection: 'column',
  mx: 'auto',
});

const HeaderLogoContainer = styled('div', {
  width: 92,
  height: 92,
  display: 'flex',
  justifyContent: 'between',
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

interface PublicHomeProps {
  file: StoryFile;
  settings: SettingsFile;
  userInfo: { username: string; address: string };
}

export const PublicHome = ({ file, settings, userInfo }: PublicHomeProps) => {
  const { resolvedTheme } = useTheme();
  const { user } = useAuth();
  const { isExperimentalFollowEnabled } = useFeatureFlags();
  const { data: userFollowing } = useGetUserFollowing({
    enabled: !!user && userInfo.username !== user.username,
  });
  const { mutate: followUser } = useUserFollow();
  const { mutate: unfollowUser } = useUserUnfollow();

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

  const siteName = settings.siteName || userInfo.username;
  const twitterHandle = settings.siteTwitterHandle;

  const featuredStoryIndex = file.stories.findIndex((story) => story.featured);
  const stories = [...file.stories];
  if (featuredStoryIndex !== -1) {
    stories.splice(featuredStoryIndex, 1);
  }

  const seoUrl = `${sigleConfig.appUrl}/${userInfo.username}`;
  const seoTitle = `${siteName} - Sigle`;
  const seoDescription =
    settings.siteDescription?.substring(0, 300) ||
    `Read stories from ${siteName} on Sigle, decentralised and open-source platform for Web3 writers`;
  const seoImage = settings.siteLogo;

  const isFollowingUser =
    userFollowing && !!userFollowing.following[userInfo.address];

  const explorer = 2121;

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
              url: seoImage || `${sigleConfig.appUrl}/static/icon-192x192.png`,
            },
          ],
        }}
        twitter={{
          site: '@sigleapp',
          cardType: 'summary',
        }}
      />
      <Container>
        <AppHeader />
        <Header>
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
            {isExperimentalFollowEnabled &&
            user &&
            user.username !== userInfo.username &&
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
          </Flex>
          <Flex align="center" gap="3">
            <Typography css={{ fontWeight: 700 }} as="h1" size="h2">
              {siteName}
            </Typography>
            <Box
              css={{ backgroundColor: '$gray4', py: '$1', px: '$3', br: '$2' }}
            >
              {userInfo.username}
            </Box>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <a
                  href={`https://gamma.io/collections/the-explorer-guild/${explorer}`}
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
                Creator + Explorer #{explorer}
              </TooltipContent>
            </Tooltip>
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
      </Container>

      <StyledContainer>
        <Tabs defaultValue="stories">
          <TabsList
            css={{ boxShadow: '0 1px 0 0 $colors$gray6', mb: 0 }}
            aria-label="See your draft"
          >
            <TabsTrigger value="stories">{`Stories (${file.stories.length})`}</TabsTrigger>
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
        </Tabs>

        <PoweredBy />
      </StyledContainer>
    </React.Fragment>
  );
};
