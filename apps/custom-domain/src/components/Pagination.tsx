'use client';
import { IconChevronRight, IconChevronLeft } from '@tabler/icons-react';
import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

const button = cva(
  [
    'w-10 h-10 border border-gray-200 flex items-center justify-center rounded disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 md:w-8 md:h-8',
  ],
  {
    variants: {
      active: {
        true: 'bg-gray-900 border-gray-900 text-white',
      },
    },
  }
);

interface PaginationProps {
  page: number;
  total: number;
  itemsPerPage: number;
}

export function Pagination({ page, total, itemsPerPage }: PaginationProps) {
  const router = useRouter();

  const totalPages = Math.ceil(total / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      router.push(`/?page=${newPage}`);
    }
  };

  const renderPageItem = (pageNum: number) => (
    <button
      key={pageNum}
      onClick={() => handlePageChange(pageNum)}
      className={clsx(button({ active: page === pageNum }), 'mx-1')}
      aria-label={`Go to page ${pageNum}`}
    >
      {pageNum}
    </button>
  );

  const renderDots = () => <span className="mx-2">...</span>;

  const renderPageItems = () => {
    const items = [];

    if (page < 5) {
      for (let i = 1; i <= Math.min(5, totalPages); i++) {
        items.push(renderPageItem(i));
      }
      if (totalPages > 5) {
        items.push(renderDots());
      }
    } else if (page > totalPages - 4) {
      if (totalPages > 5) {
        items.push(renderDots());
      }
      for (let i = totalPages - 4; i <= totalPages; i++) {
        items.push(renderPageItem(i));
      }
    } else {
      items.push(renderDots());
      for (let i = page - 2; i <= page + 2; i++) {
        items.push(renderPageItem(i));
      }
      items.push(renderDots());
    }

    return items;
  };

  return (
    <div className="mt-16 flex items-center justify-center">
      <button
        onClick={() => handlePageChange(page - 1)}
        className={clsx(button(), 'mr-2')}
        disabled={page === 1}
        aria-label="Go to prev page"
      >
        <IconChevronLeft size={16} />
      </button>
      {renderPageItems()}
      <button
        onClick={() => handlePageChange(page + 1)}
        className={clsx(button(), 'ml-2')}
        disabled={page === totalPages}
        aria-label="Go to next page"
      >
        <IconChevronRight size={16} />
      </button>
    </div>
  );
}
