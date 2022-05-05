import { useEffect, useState } from 'react';
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
  const [currentStories, setCurrentStories] = useState<SubsetStory[] | null>(
    stories
  );
  const [currentPage, setCurrentPage] = useState<number>(1);

  // how many stories we should show on each page
  let itemSize = 7;

  useEffect(() => {
    const firstPageIndex = (currentPage - 1) * itemSize;
    const lastPageIndex = firstPageIndex + itemSize;
    setCurrentStories(stories.slice(firstPageIndex, lastPageIndex));
  }, [currentPage]);

  return (
    <>
      {currentStories && (
        <>
          <Box css={{ mb: '$3', height: 476 }}>
            {currentStories?.map((story) => (
              <PublishedStoryItem key={story.id} story={story} />
            ))}
          </Box>
          <Pagination
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
            stories={stories}
            currentStoryItems={currentStories}
          />
        </>
      )}
    </>
  );
};
