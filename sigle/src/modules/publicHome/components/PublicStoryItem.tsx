import React from 'react';
import Link from 'next/link';
import format from 'date-fns/format';
import { SubsetStory, SettingsFile } from '../../../types';
import { Box, Flex, Typography } from '../../../ui';
import { darkTheme, styled } from '../../../stitches.config';
import { generateAvatar } from '../../../utils/boringAvatar';

const StoryContainer = styled('div', {
  display: 'flex',
  borderBottom: '1px solid $colors$gray6',
  py: '$7',
  gap: '$5',
  alignItems: 'center',

  '& img': {
    transform: 'none',
    transition: 'transform .5s .1s',
  },

  '&:hover': {
    '& img': {
      transform: 'scale(1.1)',
      transition: 'transform .5s .1s',
    },
    '& h4': {
      color: '$gray12',
    },
  },
});

const StoryImage = styled('img', {
  objectFit: 'cover',
  objectPosition: 'center',
  width: 80,
  height: 58,
  zIndex: -1,
  position: 'relative',

  '@md': {
    width: 180,
    height: 130,
  },
});

const ProfileImageContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  br: '$1',
  overflow: 'hidden',
  width: 18,
  height: 18,
});

const ProfileImage = styled('img', {
  width: 'auto',
  height: '100%',
  maxWidth: 18,
  maxHeight: 18,
  objectFit: 'cover',
});

interface Props {
  userInfo: { username: string; address: string };
  story: SubsetStory;
  settings: SettingsFile;
  /**
   * Options to change the card look
   */
  featured?: boolean;
  /**
   * Display the user name in the card
   */
  displayUser?: boolean;
}

export const PublicStoryItem = ({
  displayUser,
  userInfo,
  featured,
  story,
  settings,
}: Props) => {
  const storyPath = `/${userInfo.username}/${story.id}`;

  return (
    <StoryContainer
      css={{
        flexDirection: featured ? 'column' : 'row',
        '@md': {
          gap: !story.coverImage && featured ? '$5' : '$7',
        },
      }}
    >
      {story.coverImage && (
        <Link href="/[username]/[storyId]" as={storyPath} passHref>
          <Box
            css={{
              lineHeight: 0,
              position: 'relative',
            }}
            as="a"
          >
            <Box
              as="span"
              css={{
                mb: featured ? '$4' : 'none',
                display: 'inline-block',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: featured ? '$2' : '$1',

                '&::before': {
                  content: '',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: '$gray11',
                  opacity: 0,
                  transition: '.2s',

                  [`.${darkTheme} &`]: {
                    backgroundColor: '$colors$gray1',
                  },
                },

                '&:hover::before': {
                  opacity: 0.1,
                },

                '@md': {
                  mb: featured ? '$5' : 'none',
                },
              }}
            >
              <StoryImage
                css={{
                  width: featured ? 420 : 80,
                  height: featured ? 214 : 58,

                  '@md': {
                    width: featured ? 826 : 180,
                    height: featured ? 420 : 130,
                  },
                }}
                data-testid="story-cover-image"
                src={story.coverImage}
              />
            </Box>
          </Box>
        </Link>
      )}
      <Flex direction="column" css={{ flex: 1 }}>
        <Box
          css={{
            '@md': {
              mb: '$5',
            },
          }}
        >
          <Flex
            justify="between"
            css={{ gap: '$5', mb: '$1', '@md': { mb: '$2' } }}
          >
            <Link href={storyPath} passHref>
              <a>
                <Typography
                  size={{
                    '@initial': 'subheading',
                    '@md': 'h4',
                  }}
                  css={{
                    alignSelf: 'center',
                    fontWeight: 600,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    '-webkit-line-clamp': 3,
                    '-webkit-box-orient': 'vertical',
                    typographyOverflow: 'ellipsis',

                    '@md': {
                      '-webkit-line-clamp': 2,
                    },
                  }}
                  as="h4"
                  data-testid="story-title"
                >
                  {story.title}
                </Typography>
              </a>
            </Link>
          </Flex>
          <Link href={storyPath} passHref>
            <Flex as="a" gap="1" align="center">
              {displayUser ? (
                <ProfileImageContainer>
                  <ProfileImage
                    src={
                      settings.siteLogo
                        ? settings.siteLogo
                        : generateAvatar(userInfo.address)
                    }
                  />
                </ProfileImageContainer>
              ) : null}
              <Typography
                data-testid="story-date"
                css={{ color: '$gray9' }}
                size="subparagraph"
              >
                {displayUser ? `${userInfo.username} · ` : ''}
                {format(story.createdAt, 'MMMM dd, yyyy ')}
              </Typography>
            </Flex>
          </Link>
        </Box>
        <Box css={{ flex: 1 }}>
          <Link href={storyPath} passHref>
            <Typography
              as="a"
              data-testid="story-content"
              size="subheading"
              css={{
                display: 'none',

                '@md': {
                  overflow: 'hidden',
                  display: '-webkit-box',
                  '-webkit-line-clamp': 2,
                  '-webkit-box-orient': 'vertical',
                  typographyOverflow: 'ellipsis',
                  color: '$gray10',
                },
              }}
            >
              {story.content}
            </Typography>
          </Link>
        </Box>
      </Flex>
    </StoryContainer>
  );
};
