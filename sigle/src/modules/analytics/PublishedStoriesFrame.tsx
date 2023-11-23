import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { SubsetStory } from '../../types';
import { Box, Typography } from '../../ui';
import { Pagination } from './Pagination';
import { PublishedStoryItem } from './PublishedStoryItem';
import { ErrorMessage } from '../../ui/ErrorMessage';
import { useAnalyticsControllerGetHistorical } from '@/__generated__/sigle-api';

interface PublishedStoriesFrameProps {
  historicalParams: {
    dateFrom: string;
    dateGrouping: 'day' | 'month';
  };
  stories: SubsetStory[];
  loading: boolean;
}

export const PublishedStoriesFrame = ({
  historicalParams,
  stories,
  loading,
}: PublishedStoriesFrameProps) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { data: historicalData, error } = useAnalyticsControllerGetHistorical(
    {
      queryParams: historicalParams,
    },
    {},
  );

  const nbStoriesLabel = loading ? '...' : stories ? stories.length : 0;
  // how many stories we should show on each page
  const itemSize = 7;

  const currentStories = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * itemSize;
    const lastPageIndex = firstPageIndex + itemSize;
    return stories.slice(firstPageIndex, lastPageIndex);
  }, [currentPage]);

  const hasNextPage =
    currentStories[currentStories.length - 1] === stories[stories.length - 1]
      ? false
      : true;

  return (
    <Box>
      <Typography
        as="h3"
        size="subheading"
        css={{ fontWeight: 600, color: '$gray11', mb: '$3' }}
      >
        My published stories ({nbStoriesLabel})
      </Typography>
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
      <Box css={{ mb: '$3', height: 476 }}>
        {currentStories?.map((story) => (
          <PublishedStoryItem
            onClick={() =>
              router.push('/analytics/[storyId]', `/analytics/${story.id}`)
            }
            key={story.id}
            story={story}
            pageviews={
              historicalData?.stories.find((d) => d.pathname === story.id)
                ?.pageviews || 0
            }
          />
        ))}
      </Box>
      <Pagination
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
        hasNextPage={hasNextPage}
      />
    </Box>
  );
};
