import { useEffect, useState } from 'react';
import {
  TbArrowLeft,
  TbLayoutSidebarRightExpand,
  TbRocket,
} from 'react-icons/tb';
import Link from 'next/link';
import { styled } from '@sigle/stitches.config';
import { Button, Flex, IconButton } from '@sigle/ui';
import { useEditorStore } from '../store';
import { EditorSave } from './EditorSave';
import { EditorPublish } from './EditorPublish';

// Scroll logic taken from https://www.codemzy.com/blog/react-sticky-header-disappear-scroll

const StyledEditorHeader = styled('header', {
  px: '$5',
  display: 'flex',
  alignItems: 'center',
  borderBottom: 'solid 1px $gray6',
  height: '80px',
  position: 'sticky',
  transition: 'top 500ms $ease-in-out',
  backgroundColor: '$gray1',
  top: 0,
  zIndex: 1,

  defaultVariants: {
    scrollDirection: 'up',
  },
  variants: {
    scrollDirection: {
      down: {
        top: '-80px',
      },
      up: {
        top: 0,
      },
    },
  },
});

export const EditorHeader = () => {
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
    <StyledEditorHeader
      scrollDirection={scrollDirection === 'down' ? 'down' : 'up'}
      as="header"
    >
      <Flex justify="between" align="center" css={{ flex: 1 }}>
        <Link href="/drafts">
          <IconButton
            size="sm"
            variant={{ '@initial': 'light', '@md': 'ghost' }}
          >
            <TbArrowLeft />
          </IconButton>
        </Link>
        <Flex align="center" gap="4">
          <EditorSave />
          <EditorPublish />
          <IconButton
            size="sm"
            variant={{ '@initial': 'light', '@md': 'ghost' }}
            onClick={() => toggleMenu(!menuOpen)}
          >
            <TbLayoutSidebarRightExpand />
          </IconButton>
        </Flex>
      </Flex>
    </StyledEditorHeader>
  );
};
