import { styled } from '@sigle/stitches.config';
import { Button, Flex, IconButton } from '@sigle/ui';
import { useEffect, useState } from 'react';
import {
  TbArrowLeft,
  TbLayoutSidebarRightExpand,
  TbRocket,
} from 'react-icons/tb';

// Scroll logic taken from https://www.codemzy.com/blog/react-sticky-header-disappear-scroll

const StyledEditorHeader = styled('header', {
  px: '$5',
  display: 'flex',
  alignItems: 'center',
  borderBottom: 'solid 1px $gray6',
  height: '80px',
  position: 'sticky',
  transition: 'all 500ms $ease-in-out',
  backgroundColor: '$gray1',
  top: 0,

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
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up' | null>(
    null
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
        <IconButton size="sm" variant="ghost">
          <TbArrowLeft />
        </IconButton>
        <Flex align="center" gap="4">
          <Button size="sm" variant="ghost">
            Save
          </Button>
          <Button
            size="sm"
            variant="ghost"
            color="indigo"
            rightIcon={<TbRocket />}
          >
            Publish
          </Button>
          <IconButton size="sm" variant="ghost">
            <TbLayoutSidebarRightExpand />
          </IconButton>
        </Flex>
      </Flex>
    </StyledEditorHeader>
  );
};
