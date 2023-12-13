import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { Flex, IconButton } from '../../ui';

interface PaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
}

export const Pagination = ({
  currentPage,
  onPageChange,
  hasNextPage,
}: PaginationProps) => {
  const onNext = () => onPageChange(currentPage + 1);
  const onPrevious = () => onPageChange(currentPage - 1);

  return (
    <Flex role="navigation" gap="2" justify="end">
      <IconButton
        size="sm"
        css={{
          '&:disabled': {
            opacity: '50%',
            cursor: 'not-allowed',
            pointerEvents: 'none',
          },
        }}
        disabled={currentPage === 1}
        onClick={onPrevious}
        aria-label="previous page"
      >
        <ChevronLeftIcon />
      </IconButton>
      <IconButton
        size="sm"
        css={{
          '&:disabled': {
            opacity: '50%',
            cursor: 'not-allowed',
            pointerEvents: 'none',
          },
        }}
        disabled={!hasNextPage}
        onClick={onNext}
        aria-label="page"
      >
        <ChevronRightIcon />
      </IconButton>
    </Flex>
  );
};
