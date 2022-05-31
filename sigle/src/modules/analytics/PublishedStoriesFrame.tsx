import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { SubsetStory } from '../../types';
import { Box } from '../../ui';
import { Pagination } from './Pagination';
import { PublishedStoryItem } from './PublishedStoryItem';

interface PublishedStoriesFrameProps {
  stories: SubsetStory[];
}

export const PublishedStoriesFrame = ({
  stories,
}: PublishedStoriesFrameProps) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<number>(1);

  // how many stories we should show on each page
  let itemSize = 7;

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
    <>
      {currentStories && (
        <>
          <Box css={{ mb: '$3', height: 476 }}>
            {currentStories?.map((story) => (
              <PublishedStoryItem
                onClick={() =>
                  router.push('/analytics/[storyId]', `/analytics/${story.id}`)
                }
                key={story.id}
                story={story}
              />
            ))}
          </Box>
          <Pagination
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
            hasNextPage={hasNextPage}
          />
        </>
      )}
    </>
  );
};
