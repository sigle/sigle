import React from 'react';
import Link from 'next/link';
import styledC, { css } from 'styled-components';
import tw from 'twin.macro';
import format from 'date-fns/format';
import { SubsetStory, SettingsFile } from '../../../types';
import { sigleConfig } from '../../../config';
import { sanitizeHexColor } from '../../../utils/security';
import { Box, Container, Flex, Typography } from '../../../ui';
import { darkTheme, styled } from '../../../stitches.config';
import { StarFilledIcon } from '@radix-ui/react-icons';

const StoryContainer = styled('div', {
  display: 'flex',
  borderBottom: '1px solid $colors$gray6',
  py: '$7',
  gap: '$5',

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

interface Props {
  username: string;
  story: SubsetStory;
  settings: SettingsFile;
}

export const PublicStoryItem = ({ username, story, settings }: Props) => {
  const safeSiteColor =
    settings.siteColor && sanitizeHexColor(settings.siteColor);

  return (
    <>
      <StoryContainer
        css={{
          display: story.featured ? 'block' : 'flex',
          '@md': {
            gap: !story.coverImage && story.featured ? '$5' : '$7',
          },
        }}
      >
        {/* {!story.coverImage && story.featured && (
          <Box
            css={{
              p: '$2',
              backgroundColor: '$gray1',
              br: '$round',
              color: '$orange10',
            }}
          >
            <StarFilledIcon />
          </Box>
        )} */}
        {story.coverImage && (
          <Link href="/stories/[storyId]" as={`/stories/${story.id}`} passHref>
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
                  mb: story.featured ? '$4' : 'none',
                  display: 'inline-block',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: story.featured ? '$2' : '$1',

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
                    mb: story.featured ? '$5' : 'none',
                  },
                }}
              >
                {/* {story.featured && (
                  <Box
                    css={{
                      p: '$2',
                      backgroundColor: '$gray1',
                      br: '$round',
                      color: '$orange10',
                      position: 'absolute',
                      top: '-$2',
                      right: '-$2',
                    }}
                  >
                    <StarFilledIcon />
                  </Box>
                )} */}
                <StoryImage
                  css={{
                    width: story.featured ? 420 : 80,
                    height: story.featured ? 214 : 58,

                    '@md': {
                      width: story.featured ? 826 : 180,
                      height: story.featured ? 420 : 130,
                    },
                  }}
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
              <Link
                href="/stories/[storyId]"
                as={`/stories/${story.id}`}
                passHref
              >
                <a>
                  <Typography
                    css={{
                      fontSize: '$2',
                      lineHeight: '20.4px',
                      alignSelf: 'center',
                      fontWeight: 600,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      '-webkit-line-clamp': 3,
                      '-webkit-box-orient': 'vertical',
                      typographyOverflow: 'ellipsis',

                      '@md': {
                        fontSize: '18px',
                        lineHeight: '1.5rem',
                        '-webkit-line-clamp': 2,
                      },
                    }}
                    as="h4"
                  >
                    {story.title}
                  </Typography>
                </a>
              </Link>
            </Flex>
            <Link
              href="/stories/[storyId]"
              as={`/stories/${story.id}`}
              passHref
            >
              <Typography css={{ color: '$gray9' }} size="subparagraph" as="a">
                {format(story.createdAt, 'MMMM dd, yyyy ')}
                <Box
                  css={{
                    display: 'none',
                    '@md': { display: 'block' },
                  }}
                  as="span"
                >
                  at
                  {format(story.createdAt, ' hh:mmaaa')}
                </Box>
              </Typography>
            </Link>
          </Box>
          <Box css={{ flex: 1 }}>
            <Link
              href="/stories/[storyId]"
              as={`/stories/${story.id}`}
              passHref
            >
              <Typography
                as="a"
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
    </>
  );
};
