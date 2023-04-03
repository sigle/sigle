import { IconChevronRight, IconChevronLeft } from '@tabler/icons-react';
import Link from 'next/link';

interface PaginationProps {
  page: number;
  total: number;
  perPage: number;
}

const PaginationButton = ({
  children,
  href,
  ariaLabel,
  disabled,
}: {
  children: React.ReactNode;
  href: string;
  ariaLabel: string;
  disabled?: boolean;
}) => {
  if (disabled) {
    return (
      <button
        aria-label={ariaLabel}
        className="w-8 h-8 border border-gray-200 bg-gray-50 flex items-center justify-center rounded-l cursor-not-allowed"
        disabled
      >
        {children}
      </button>
    );
  }

  return (
    <Link
      aria-label={`Go to ${ariaLabel} page`}
      href={href}
      className="w-8 h-8 border border-l-0 border-gray-200 flex items-center justify-center rounded-r"
    >
      {children}
    </Link>
  );
};

export function Pagination({ page, total, perPage }: PaginationProps) {
  const startIndex = (page - 1) * perPage + 1;
  let endIndex = page * perPage;
  if (endIndex >= total) {
    endIndex = total;
  }
  const disabledPrev = page === 1;
  const disabledNext = endIndex >= total;

  return (
    <div className="mt-16 flex items-center justify-end">
      <div>
        <strong>{startIndex}</strong> to <strong>{endIndex}</strong> of {total}
      </div>
      <div className="flex items-center justify-center ml-2">
        <PaginationButton
          ariaLabel="Prev"
          href={`/?page=${page - 1}`}
          disabled={disabledPrev}
        >
          <IconChevronLeft color="#1A1A1A" size={16} />
        </PaginationButton>
        <PaginationButton
          ariaLabel="Next"
          href={`/?page=${page + 1}`}
          disabled={disabledNext}
        >
          <IconChevronRight color="#1A1A1A" size={16} />
        </PaginationButton>
      </div>
    </div>
  );
}
