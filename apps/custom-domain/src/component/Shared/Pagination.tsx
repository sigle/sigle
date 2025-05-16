"use client";

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import { useRouter } from "next/navigation";

const button = cva(
  [
    "flex h-10 w-10 items-center justify-center rounded border border-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 md:h-8 md:w-8",
  ],
  {
    variants: {
      active: {
        true: "border-gray-900 bg-gray-900 text-white",
      },
    },
  },
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
      router.push(newPage === 1 ? "/" : `/?page=${newPage}`);
    }
  };

  const renderPageItem = (pageNum: number) => (
    <button
      key={pageNum}
      onClick={() => handlePageChange(pageNum)}
      className={clsx(button({ active: page === pageNum }), "mx-1")}
      aria-label={`Go to page ${pageNum}`}
      type="button"
    >
      {pageNum}
    </button>
  );

  const renderDots = () => <span className="mx-2">...</span>;

  const renderPageItems = () => {
    const maxPagesToShow = 4;
    const items = [];
    const sidePagesToShow = Math.floor(maxPagesToShow / 2);

    if (page <= sidePagesToShow + 1) {
      for (let i = 1; i <= Math.min(maxPagesToShow, totalPages); i++) {
        items.push(renderPageItem(i));
      }
      if (totalPages > maxPagesToShow) {
        items.push(renderDots());
        items.push(renderPageItem(totalPages));
      }
    } else if (page > totalPages - sidePagesToShow) {
      if (totalPages > maxPagesToShow) {
        items.push(renderPageItem(1));
        items.push(renderDots());
      }
      for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
        items.push(renderPageItem(i));
      }
    } else {
      items.push(renderPageItem(1));
      items.push(renderDots());
      for (let i = page - sidePagesToShow; i <= page + sidePagesToShow; i++) {
        items.push(renderPageItem(i));
      }
      items.push(renderDots());
      items.push(renderPageItem(totalPages));
    }

    return items;
  };

  return (
    <div className="mt-16 flex items-center justify-center">
      <button
        onClick={() => handlePageChange(page - 1)}
        className={clsx(button(), "mr-2")}
        disabled={page === 1}
        aria-label="Go to prev page"
        type="button"
      >
        <IconChevronLeft size={16} />
      </button>
      {renderPageItems()}
      <button
        onClick={() => handlePageChange(page + 1)}
        className={clsx(button(), "ml-2")}
        disabled={page === totalPages}
        aria-label="Go to next page"
        type="button"
      >
        <IconChevronRight size={16} />
      </button>
    </div>
  );
}
