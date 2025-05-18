"use client";

import { cn } from "@/lib/cn";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ShareSocial } from "./ShareSocial";

const scrollToElement = (id: string, offset = 16): void => {
  const element = document.getElementById(id);
  if (element) {
    const rect = element.getBoundingClientRect();
    const top = rect.top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }
};

const useIntersectionObserver = (setActiveId: (id: string) => void) => {
  const headingElementsRef = useRef<Record<string, IntersectionObserverEntry>>(
    {},
  );
  useEffect(() => {
    const callback = (headings: IntersectionObserverEntry[]) => {
      headingElementsRef.current = headings.reduce((map, headingElement) => {
        map[headingElement.target.id] = headingElement;
        return map;
      }, headingElementsRef.current);

      const visibleHeadings: IntersectionObserverEntry[] = [];
      for (const key of Object.keys(headingElementsRef.current)) {
        const headingElement = headingElementsRef.current[key];
        if (headingElement.isIntersecting) visibleHeadings.push(headingElement);
      }

      const getIndexFromId = (id: string) =>
        headingElements.findIndex((heading) => heading.id === id);

      if (visibleHeadings.length === 1) {
        setActiveId(visibleHeadings[0].target.id);
      } else if (visibleHeadings.length > 1) {
        const sortedVisibleHeadings = visibleHeadings.sort(
          (a, b) => getIndexFromId(a.target.id) - getIndexFromId(b.target.id),
        );
        setActiveId(sortedVisibleHeadings[0].target.id);
      }
    };

    const observer = new IntersectionObserver(callback, {
      rootMargin: "0px 0px -40% 0px",
    });

    const headingElements = Array.from(
      document.querySelectorAll("h2, h3"),
    ) as HTMLElement[];

    for (const element of headingElements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [setActiveId]);
};

interface TableOfContentsProps {
  items: Array<{ level: 2 | 3; text: string; id: string }>;
  post: {
    id: string;
    title: string;
  };
}

export const TableOfContents = ({ items, post }: TableOfContentsProps) => {
  const router = useRouter();
  const [activeId, setActiveId] = useState();
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  useIntersectionObserver(setActiveId as any);

  return (
    <nav className="overflow-auto md:sticky	md:top-20">
      <p className="text-[0.625rem] font-bold uppercase tracking-wide text-gray-500">
        Table of contents
      </p>
      <ul>
        {items.map((item) => (
          <li
            key={item.id}
            className={cn("mt-3 text-sm", {
              "ml-3": item.level === 3,
              "font-bold": activeId === item.id,
            })}
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
