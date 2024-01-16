'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flex, IconButton } from '@radix-ui/themes';
import {
  IconArrowLeft,
  IconLayoutSidebarRightExpand,
} from '@tabler/icons-react';
import { cn } from '@/lib/cn';
import { useEditorStore } from './store';
import { EditorPublish } from './editor-publish';
import { EditorSave } from './editor-save';

const headerIconSize = 20;

/**
 * Scroll logic taken from https://www.codemzy.com/blog/react-sticky-header-disappear-scroll
 */
export const EditorHeader = ({ onSave }: { onSave: () => void }) => {
  const menuOpen = useEditorStore((state) => state.menuOpen);
  const toggleMenu = useEditorStore((state) => state.toggleMenu);
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up' | null>(
    null,
  );

  useEffect(() => {
    let lastScrollY = window.pageYOffset;

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      if (
        direction !== scrollDirection &&
        (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)
      ) {
        setScrollDirection(direction);
      }
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };
    window.addEventListener('scroll', updateScrollDirection);
    return () => {
      window.removeEventListener('scroll', updateScrollDirection);
    };
  }, [scrollDirection]);

  return (
    <header
      className={cn(
        'flex items-center px-6 h-[80px] sticky transition-all duration-500 border-b border-gray-5 bg-gray-1 z-10',
        {
          'top-0': scrollDirection === 'up',
          '-top-[80px]': scrollDirection === 'down',
        },
      )}
    >
      <Flex justify="between" align="center" className="flex-1">
        <Flex align="start" gap="6">
          <Link href="/dashboard/drafts">
            <IconButton size="2" variant="ghost" color="gray" highContrast>
              <IconArrowLeft size={headerIconSize} />
            </IconButton>
          </Link>
        </Flex>
        <Flex align="center" gap="6">
          <EditorSave onSave={onSave} />
          <EditorPublish />
          <IconButton
            size="2"
            variant="ghost"
            color="gray"
            highContrast
            onClick={() => toggleMenu(!menuOpen)}
          >
            <IconLayoutSidebarRightExpand size={headerIconSize} />
          </IconButton>
        </Flex>
      </Flex>
    </header>
  );
};
