'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ShareSocial } from './ShareSocial';

const scrollToElement = (id: string, offset = 16): void => {
  const element = document.getElementById(id);
  if (element) {
    const rect = element.getBoundingClientRect();
    const top = rect.top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
};

const useIntersectionObserver = (setActiveId: any) => {
  const headingElementsRef = useRef<any>({});
  useEffect(() => {
    const callback = (headings: any) => {
      headingElementsRef.current = headings.reduce(
        (map: any, headingElement: any) => {
          map[headingElement.target.id] = headingElement;
          return map;
        },
        headingElementsRef.current
      );

      const visibleHeadings: any[] = [];
      Object.keys(headingElementsRef.current).forEach((key) => {
        const headingElement = headingElementsRef.current[key];
        if (headingElement.isIntersecting) visibleHeadings.push(headingElement);
      });

      const getIndexFromId = (id: any) =>
        headingElements.findIndex((heading) => heading.id === id);

      if (visibleHeadings.length === 1) {
        setActiveId(visibleHeadings[0].target.id);
      } else if (visibleHeadings.length > 1) {
        const sortedVisibleHeadings = visibleHeadings.sort(
          (a, b) =>
            (getIndexFromId(a.target.id) > getIndexFromId(b.target.id)) as any
        );
        setActiveId(sortedVisibleHeadings[0].target.id);
      }
    };

    const observer = new IntersectionObserver(callback, {
      rootMargin: '0px 0px -40% 0px',
    });

    const headingElements = Array.from(document.querySelectorAll('h2, h3'));

    headingElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [setActiveId]);
};

interface TableOfContentsProps {
  items: Array<{ level: 2 | 3; text: string; id: string }>;
  post: {
    title: string;
  };
}

export const TableOfContents = ({ items, post }: TableOfContentsProps) => {
  const router = useRouter();
  const [activeId, setActiveId] = useState();
  useIntersectionObserver(setActiveId);

  return (
    <nav className="overflow-auto md:sticky	md:top-20">
      <p className="text-[0.625rem] font-bold uppercase tracking-wide text-gray-500">
        Table of content
      </p>
      <ul>
        {items.map((item, index) => (
          <li
            key={index}
            className={twMerge(
              clsx('mt-3 text-sm', {
                ['ml-3']: item.level === 3,
                ['font-bold']: activeId === item.id,
              })
            )}
          >
            <a
              className="line-clamp-2"
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                router.push(`${location.pathname}#${item.id}`);
                scrollToElement(item.id);
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>

      <ShareSocial post={post} />
    </nav>
  );
};
