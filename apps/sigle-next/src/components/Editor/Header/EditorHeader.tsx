'use client';

import { cn } from '@/lib/cn';
import { Flex, IconButton } from '@radix-ui/themes';
import {
  IconArrowLeft,
  IconLayoutSidebarRightExpand,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import type { EditorPostFormData } from '../EditorFormProvider';
import { useEditorStore } from '../store';
import { EditorPublish } from './EditorPublish';
import { EditorSave } from './EditorSave';

const headerIconSize = 20;

/**
 * Scroll logic taken from https://www.codemzy.com/blog/react-sticky-header-disappear-scroll
 */
export const EditorHeader = () => {
  const { watch } = useFormContext<EditorPostFormData>();
  const type = watch('type');
  const menuOpen = useEditorStore((state) => state.menuOpen);
  const setMenuOpen = useEditorStore((state) => state.setMenuOpen);
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
        <Flex align="center" gap="6">
          <IconButton
            size="2"
            variant="ghost"
            color="gray"
            highContrast
            asChild
          >
            <Link href="/dashboard/drafts">
              <IconArrowLeft size={headerIconSize} />
            </Link>
          </IconButton>
          {type === 'draft' ? <EditorSave /> : null}
        </Flex>
        <Flex align="center" gap="6">
          <EditorPublish />
          <IconButton
            size="2"
            variant="ghost"
            color="gray"
            highContrast
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <IconLayoutSidebarRightExpand size={headerIconSize} />
          </IconButton>
        </Flex>
      </Flex>
    </header>
  );
};
