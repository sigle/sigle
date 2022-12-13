import Link from 'next/link';
import format from 'date-fns/format';
import { styled } from '../../stitches.config';
import { SettingsFile, SubsetStory } from '../../types';
import { Box, Flex, Typography } from '../../ui';
import { generateAvatar } from '../../utils/boringAvatar';
import { StoryCardProfileImage } from './StoryCardProfileImage';
import { StoryCardImage } from './StoryCardImage';

const StoryContainer = styled('div', {
  display: 'flex',
  borderBottom: '1px solid $colors$gray6',
  py: '$7',

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

const StoryTitle = styled(Typography, {
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
});

const StoryContent = styled(Typography, {
  display: 'none',

  '@md': {
    overflow: 'hidden',
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    typographyOverflow: 'ellipsis',
    color: '$gray10',
  },
});

interface StoryCardProps {
  userInfo: { username: string; address: string };
  story: Pick<
    SubsetStory,
    'id' | 'coverImage' | 'title' | 'createdAt' | 'content'
  >;
  settings: Pick<SettingsFile, 'siteLogo' | 'siteName'>;
  /**
   * Options to change the card look
   */
  featured?: boolean;
  /**
   * Display the user name in the card
   */
  displayUser?: boolean;
}

export const StoryCard = ({
  userInfo,
  story,
  settings,
  featured,
  displayUser,
}: StoryCardProps) => {
  const storyPath = `/${userInfo.username}/${story.id}`;

  const displayName = settings.siteName ? settings.siteName : userInfo.username;

  return (
    <StoryContainer
      css={{
        flexDirection: featured ? 'column' : 'row',
        alignItems: featured ? 'start' : 'center',
        gap: story.coverImage && featured ? 0 : '$5',
        '@md': {
          alignItems: 'center',
          gap: story.coverImage && featured ? 0 : '$7',
        },
      }}
    >
      {story.coverImage && (
        <Link
          href="/[username]/[storyId]"
          as={storyPath}
          passHref
          legacyBehavior
        >
          <Box
            css={{
              lineHeight: 0,
              position: 'relative',
            }}
            as="a"
          >
            <StoryCardImage featured={featured} image={story.coverImage} />
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
              <StoryTitle
                size={{
                  '@initial': 'subheading',
                  '@md': 'h4',
                }}
                as="h4"
                data-testid="story-title"
              >
                {story.title}
              </StoryTitle>
            </Link>
          </Flex>
          <Link href={storyPath} passHref legacyBehavior>
            <Flex as="a" gap="1" align="center">
              {displayUser ? (
                <StoryCardProfileImage
                  image={
                    settings.siteLogo
                      ? settings.siteLogo
                      : generateAvatar(userInfo.address)
                  }
                />
              ) : null}
              <Typography
                data-testid="story-date"
                css={{ color: '$gray9' }}
                size="subparagraph"
              >
                {displayUser ? `${displayName} · ` : ''}
                {format(story.createdAt, 'MMMM dd, yyyy ')}
              </Typography>
            </Flex>
          </Link>
        </Box>
        <Box css={{ flex: 1 }}>
          <Link href={storyPath} passHref legacyBehavior>
            <StoryContent as="a" data-testid="story-content" size="subheading">
              {story.content}
            </StoryContent>
          </Link>
        </Box>
      </Flex>
    </StoryContainer>
  );
};
