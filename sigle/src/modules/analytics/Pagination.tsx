import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { SubsetStory } from '../../types';
import { Flex, IconButton } from '../../ui';

interface PaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  stories: SubsetStory[];
  currentStoryItems: SubsetStory[];
}

export const Pagination = ({
  currentPage,
  onPageChange,
  stories,
  currentStoryItems,
}: PaginationProps) => {
  const lastPage =
    currentStoryItems[currentStoryItems.length - 1] ===
    stories[stories.length - 1];

  const onNext = () => onPageChange(currentPage + 1);
  const onPrevious = () => onPageChange(currentPage - 1);

  return (
    <Flex role="navigation" gap="2" justify="end">
      <IconButton
        css={{
          '&:disabled': {
            opacity: '50%',
            cursor: 'not-allowed',
            pointerEvents: 'none',
          },
        }}
        disabled={currentPage === 1}
        onClick={onPrevious}
      >
        <ChevronLeftIcon />
      </IconButton>
      <IconButton
        onClick={onNext}
        css={{
          '&:disabled': {
            opacity: '50%',
            cursor: 'not-allowed',
            pointerEvents: 'none',
          },
        }}
        disabled={lastPage}
      >
        <ChevronRightIcon />
      </IconButton>
    </Flex>
  );
};
