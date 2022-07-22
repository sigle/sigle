import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import readingTime from 'reading-time';
import { useEffect, useMemo, useState } from 'react';
import { SettingsFile, Story } from '../../types';
import { sanitizeHexColor } from '../../utils/security';
import { sigleConfig } from '../../config';
import { TipTapEditor } from '../editor/TipTapEditor';
import { styled } from '../../stitches.config';
import {
  Box,
  Button,
  Container,
  Flex,
  Typography,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '../../ui';
import { PoweredBy } from './PoweredBy';
import { getTextFromHtml } from '../editor/utils/getTextFromHtml';
import { AppHeader } from '../layout/components/AppHeader';
import format from 'date-fns/format';
import Link from 'next/link';
import { ShareButtons } from './ShareButtons';
import { generateAvatar } from '../../utils/boringAvatar';
import {
  useGetUserFollowing,
  useUserFollow,
  useUserUnfollow,
} from '../../hooks/appData';
import { useAuth } from '../auth/AuthContext';
import { useGetUserByAddress } from '../../hooks/users';
import Image from 'next/future/image';
import { useTheme } from 'next-themes';

const ProfileImageContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  br: '$1',
  overflow: 'hidden',
  width: 48,
  height: 48,
});

const ProfileImage = styled('img', {
  width: 'auto',
  height: '100%',
  objectFit: 'cover',
});

const PublicStoryContainer = styled('div', {
  margin: '0 auto',
  paddingTop: '$15',
  paddingBottom: '$15',
  px: '$4',
});

interface ShareButtonsOnScrollProps {
  username: string;
  story: Story;
  settings: SettingsFile;
}

const ShareButtonsOnScroll = ({
  username,
  story,
  settings,
}: ShareButtonsOnScrollProps) => {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleScroll = () => {
    if (window.scrollY > 200) {
      setIsShown(true);
    } else {
      setIsShown(false);
    }
  };

  return (
    <Container
      css={{
        display: 'flex',
        position: 'relative',
        justifyContent: 'center',
        mb: '$5',
        '@xl': {
          justifyContent: 'end',
          bottom: 40,
          right: 0,
          left: 0,
          position: 'fixed',
          opacity: isShown ? 1 : 0,
          transform: isShown ? 'none' : 'translateY(100%)',
          transition: 'opacity 0.4s, transform 0.6s',
        },
      }}
    >
      <Box>
        <Typography
          size="subheading"
          css={{ mt: 0, mb: '$3', color: '$gray11' }}
        >
          Share this story
        </Typography>
        <ShareButtons username={username} story={story} settings={settings} />
      </Box>
    </Container>
  );
};

interface PublicStoryProps {
  story: Story;
  settings: SettingsFile;
  userInfo: { username: string; address: string };
}

export const PublicStory = ({
  story,
  settings,
  userInfo,
}: PublicStoryProps) => {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { user, isLegacy } = useAuth();
  const { data: userFollowing } = useGetUserFollowing({
    enabled: !!user && userInfo.username !== user.username,
  });
  const { data: userInfoByAddress } = useGetUserByAddress(userInfo.address);
  const { mutate: followUser } = useUserFollow();
  const { mutate: unfollowUser } = useUserUnfollow();
  const { username, storyId } = router.query as {
    username: string;
    storyId: string;
  };

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

  const storyReadingTime = useMemo(
    () =>
      story.content ? readingTime(getTextFromHtml(story.content)) : undefined,
    [story.content]
  );

  const siteName = settings.siteName || username;
  const safeSiteColor =
    settings.siteColor && sanitizeHexColor(settings.siteColor);

  const seoUrl = `${sigleConfig.appUrl}/${username}/${storyId}`;
  const seoTitle = story.metaTitle || `${story.title} | Sigle`;
  const seoDescription = story.metaDescription;
  const seoImage = story.metaImage || story.coverImage;

  return (
    <>
      <NextSeo
        title={seoTitle}
        description={story.metaDescription}
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
          cardType: seoImage ? 'summary_large_image' : 'summary',
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

      <AppHeader />

      <PublicStoryContainer
        className="prose dark:prose-invert lg:prose-lg sigle-content"
        css={{
          "& :where(a):not(:where([class~='not-prose'] *))": {
            color: safeSiteColor,
          },
          "& :where(a strong):not(:where([class~='not-prose'] *))": {
            color: safeSiteColor,
          },
        }}
      >
        <Flex
          justify="between"
          align="end"
          css={{ mb: '$7' }}
          className="not-prose"
        >
          <Link href="/[username]" as={`/${username}`} passHref>
            <Flex as="a" align="center" gap="3">
              <ProfileImageContainer>
                <ProfileImage
                  css={{
                    maxWidth: 48,
                    maxHeight: 48,
                  }}
                  src={
                    settings?.siteLogo
                      ? settings.siteLogo
                      : generateAvatar(userInfo.address)
                  }
                />
              </ProfileImageContainer>
              <Box>
                <HoverCard openDelay={300}>
                  <Link href={`/${username}`} passHref>
                    <HoverCardTrigger asChild>
                      <Typography as="a" size="subheading">
                        {siteName}
                      </Typography>
                    </HoverCardTrigger>
                  </Link>
                  <HoverCardContent
                    sideOffset={40}
                    css={{
                      display: 'flex',
                      gap: '$2',
                      flexDirection: 'column',
                      width: 280,
                    }}
                  >
                    <Flex justify="between">
                      <ProfileImageContainer
                        css={{
                          width: 56,
                          height: 56,
                        }}
                      >
                        <ProfileImage
                          css={{
                            maxWidth: 56,
                            maxHeight: 56,
                          }}
                          src={
                            settings?.siteLogo
                              ? settings.siteLogo
                              : generateAvatar(userInfo.address)
                          }
                        />
                      </ProfileImageContainer>
                      {user &&
                      user.username !== userInfo.username &&
                      !isLegacy &&
                      userFollowing ? (
                        !isFollowingUser ? (
                          <Button
                            color="orange"
                            css={{ ml: '$5', alignSelf: 'start' }}
                            onClick={handleFollow}
                          >
                            Follow
                          </Button>
                        ) : (
                          <Button
                            variant="subtle"
                            css={{ ml: '$5', alignSelf: 'start' }}
                            onClick={handleUnfollow}
                          >
                            Unfollow
                          </Button>
                        )
                      ) : null}
                    </Flex>
                    <Flex gap="1" align="center">
                      <Typography css={{ fontWeight: 600 }} size="subheading">
                        {siteName}
                      </Typography>
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
                                width={12}
                                height={12}
                              />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent
                            css={{ boxShadow: 'none' }}
                            side="right"
                            sideOffset={8}
                          >
                            Creator + Explorer #
                            {userInfoByAddress.subscription.nftId}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </Flex>
                    <Typography css={{ color: '$gray9' }} size="subheading">
                      {settings.siteDescription}
                    </Typography>
                    <Flex gap="3">
                      <Typography size="subheading" css={{ color: '$gray9' }}>
                        <Box css={{ color: '$gray11', mr: 2 }} as="span">
                          0
                        </Box>
                        Followers
                      </Typography>
                      <Typography size="subheading" css={{ color: '$gray9' }}>
                        <Box css={{ color: '$gray11', mr: 2 }} as="span">
                          1
                        </Box>
                        Following
                      </Typography>
                    </Flex>
                  </HoverCardContent>
                </HoverCard>
                <Typography
                  size="subheading"
                  css={{
                    display: 'flex',
                    gap: '$2',
                    color: '$gray9',
                    mt: '$1',
                  }}
                >
                  {format(story.createdAt, 'MMM dd')}
                  <span>•</span>
                  <span>{storyReadingTime?.text}</span>
                </Typography>
              </Box>
            </Flex>
          </Link>
          <ShareButtons username={username} story={story} settings={settings} />
        </Flex>
        <h1 className="sigle-title">{story.title}</h1>
        {story.coverImage && (
          <Box
            css={{
              margin: '$8 auto',
              display: 'flex',
              justifyContent: 'center',
            }}
            className="not-prose"
          >
            <Box
              css={{
                '@md': {
                  marginLeft: '-$20',
                  marginRight: '-$20',
                },
              }}
            >
              <img className="sigle-cover" src={story.coverImage} />
            </Box>
          </Box>
        )}
        <TipTapEditor story={story} editable={false} />
        <ShareButtonsOnScroll
          username={username}
          story={story}
          settings={settings}
        />
        <PoweredBy />
      </PublicStoryContainer>
    </>
  );
};
