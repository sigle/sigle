import { ArrowLeftIcon, ArrowRightIcon } from '@radix-ui/react-icons';
import { stagger } from 'motion';
import { useMotionAnimate } from 'motion-hooks';
import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { sigleConfig } from '../../config';
import { styled } from '../../stitches.config';
import { SubsetStory } from '../../types';
import { Box, Flex, Text } from '../../ui';
import { AnalyticsHistoricalResponse } from './stats/types';
import { FATHOM_MAX_FROM_DATE } from './stats/utils';

const StoryImage = styled('img', {
  objectFit: 'cover',
  objectPosition: 'center',
  width: 60,
  height: 43,
  br: '$1',
});

const baseUrl = sigleConfig.baseUrl;

const fetchStoryViews = async (storyId: string) => {
  const url = `${baseUrl}/api/analytics/historical?dateFrom=${FATHOM_MAX_FROM_DATE}&dateGrouping=month&storyId=${storyId}`;

  const statsRes = await fetch(url, { credentials: 'include' });

  if (!statsRes.ok) {
    throw new Error(`Error: ${statsRes.status} - ${statsRes.statusText}`);
  }

  const statsData: AnalyticsHistoricalResponse = await statsRes.json();
  let views;
  if (statsData.stories.length > 0) {
    views = statsData.stories[0].pageviews;
  } else {
    views = 0;
  }
  return views;
};

interface PublishedStoryItemProps {
  story: SubsetStory;
  onClick: () => void;
  individualStory?: boolean;
}

export const PublishedStoryItem = ({
  story,
  onClick,
  individualStory = false,
}: PublishedStoryItemProps) => {
  const { data } = useQuery<number, Error>(['fetchStoryStats'], () =>
    fetchStoryViews(story.id)
  );
  const { play } = useMotionAnimate(
    '.story-item',
    { opacity: 1 },
    {
      delay: stagger(0.075),
      duration: 0.5,
      easing: 'ease-in-out',
    }
  );

  // Play the animation on mount of the component
  useEffect(() => {
    play();
  }, []);

  return (
    <Flex
      className="story-item"
      align="center"
      css={{
        borderTop: !individualStory ? '1px solid $colors$gray6' : 'none',
        borderBottom: individualStory ? '1px solid $colors$gray6' : 'none',
        height: 68,
        cursor: 'pointer',
        position: 'relative',
        opacity: 0,

        '& svg': {
          transition: 'transform .3s ease-in-out',
        },

        '&:hover': {
          backgroundColor: '$gray2',
          '& svg': {
            transform: !individualStory
              ? 'translateX(-4px)'
              : 'translateX(4px)',
          },

          '& div:first-child': {
            display: 'block',
            backgroundColor: '$gray11',
          },
        },

        '& div:first-child': {
          position: 'absolute',
          width: '$1',
          top: -1,
          bottom: 0,
          left: '-2px',
          height: 'calc(100% + 2px)',
          borderTopLeftRadius: '$1',
          borderBottomLeftRadius: '$1',
          zIndex: 1,
        },
      }}
      onClick={onClick}
    >
      {individualStory && <ArrowLeftIcon />}
      <Box />
      {story.coverImage && (
        <StoryImage
          css={{ ml: individualStory ? '$5' : '$2' }}
          src={story.coverImage}
        />
      )}
      <Flex
        align="center"
        css={{
          flex: 1,
          justifyContent: 'space-between',
          gap: '$5',
        }}
      >
        <Text
          size="sm"
          as="h4"
          css={{
            ml: '$5',
            fontWeight: 600,
            overflow: 'hidden',
            display: '-webkit-box',
            '-webkit-line-clamp': 2,
            '-webkit-box-orient': 'vertical',
            textOverflow: 'ellipsis',
            color: '$gray11',

            '&:hover': {
              color: '$gray12',
            },
          }}
        >
          {story.title}
        </Text>
        <Flex align="center" css={{ gap: '$5', flexShrink: 0 }}>
          {!individualStory && (
            <>
              <Text size="sm">{data} views</Text>
              <ArrowRightIcon />
            </>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};
