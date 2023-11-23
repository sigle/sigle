import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { keyframes, styled } from '../../../stitches.config';
import { Box, Dialog, DialogContent, Flex, StyledOverlay } from '../../../ui';
import { Switch, SwitchThumb } from '../../../ui/Switch';
import { userSession } from '../../../utils/blockstack';
import { useQueryClient } from '@tanstack/react-query';
import Draggable from 'react-draggable';
import { TouchEvent, useRef, useState } from 'react';
import { useMotionAnimate, useMotionTimeline } from 'motion-hooks';
import {
  ArchiveIcon,
  CrumpledPaperIcon,
  EyeOpenIcon,
  HomeIcon,
  LightningBoltIcon,
  MixIcon,
} from '@radix-ui/react-icons';
import { useAuth } from '../../auth/AuthContext';

const overlayShow = keyframes({
  '0%': { transform: `matrix(1, 0, 0, 1, 0, 300)` },
  '100%': { transform: `matrix(1, 0, 0, 1, 0, 0)` },
});

const DragHandleArea = styled('div', {
  width: '100%',
  position: 'fixed',
  display: 'grid',
  placeItems: 'center',
  top: 0,
  left: 0,
  right: 0,
  mx: 'auto',
  py: '$5',
});

const DragHandleBar = styled('div', {
  position: 'absolute',
  width: 32,
  height: 4,
  br: '$1',
  backgroundColor: '$gray8',
  transition: 'rotate 0.5s ease',
});

const StyledDialogItem = styled('div', {
  p: '$4',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  userSelect: 'none',
  cursor: 'pointer',
  textDecorationColor: '$gray9',

  '&:active': {
    color: '$gray9',
  },

  variants: {
    color: {
      gray: {
        color: '$gray9',
      },
    },
  },
});

const StyledDialogContent = styled(DialogContent, {
  bottom: 0,
  left: 0,
  right: 0,
  top: 'auto',
  transform: 'none',
  width: '100%',
  maxHeight: '100%',
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${overlayShow} 500ms cubic-bezier(0.16, 1, 0.3, 1)`,
  },
});

interface MobileHeaderProps {
  open: boolean;
  onClose: () => void;
}

export const MobileHeader = ({ open, onClose }: MobileHeaderProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  // give target element a ref to avoid 'findDOMNode' deprecation error - https://blog.logrocket.com/create-draggable-components-react-draggable/#:~:text=Handling%20the%C2%A0findDOMNode%20deprecation%20error
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | undefined>({
    x: 0,
    y: 0,
  });
  const initPos = useRef<number | null>(null);
  const currentPos = useRef<number | null>(null);
  const { play: exitAnimation } = useMotionAnimate(
    nodeRef,
    {
      transform: `matrix(1, 0, 0, 1, 0, 600)`,
    },
    {
      duration: 0.5,
    },
  );
  const { play: canceledAnimation } = useMotionAnimate(
    nodeRef,
    {
      transform: `matrix(1, 0, 0, 1, 0, 0)`,
    },
    {
      duration: 0.5,
    },
  );
  const { play: growAnimation } = useMotionTimeline(
    [
      [
        nodeRef,
        {
          bottom: 0,
          borderRadius: 0,
          height: '100%',
        },
      ],
      ['.handleLeft', { rotate: [-15, 15] }, { at: 0.25 }],
      ['.handleRight', { rotate: [15, -15] }, { at: 0.25 }],
    ],
    {
      duration: 0.5,
    },
  );

  const handleThemeToggle = () => {
    resolvedTheme === 'dark' ? setTheme('light') : setTheme('dark');
  };

  const handleLogout = () => {
    queryClient.removeQueries();
    userSession.signUserOut();
    signOut();
  };

  const handleDragStart = (e: TouchEvent) => {
    const touch = e.touches[0];

    initPos.current = touch.clientY;
  };

  const handleDragging = (e: TouchEvent) => {
    const touch = e.touches[0];

    currentPos.current = touch.clientY;

    const difference = initPos.current
      ? currentPos.current - initPos.current
      : 0;

    if (difference > 0) {
      setDragPos({ x: 0, y: difference });
    } else {
      // slow down acceleration if user drags up
      setDragPos({ x: 0, y: difference / 5 });
      setTimeout(growAnimation, 200);
    }
  };

  const handleDragEnd = () => {
    setDragPos(undefined);
    if (dragPos && dragPos.y >= 100) {
      exitAnimation();
      setTimeout(onClose, 300);
    } else {
      canceledAnimation();
    }
  };

  const upperNavItems = [
    {
      name: 'Drafts',
      path: '/',
      icon: CrumpledPaperIcon,
    },
    {
      name: 'Published',
      path: '/published',
      icon: ArchiveIcon,
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: MixIcon,
    },
    {
      name: 'Feed',
      path: '/feed',
      icon: LightningBoltIcon,
    },
    {
      name: 'Explore',
      path: '/explore',
      icon: EyeOpenIcon,
    },
    {
      name: 'Profile',
      path: '/[username]',
      icon: HomeIcon,
    },
  ];

  const lowerNavItems = [
    {
      name: 'Settings',
      path: '/settings',
    },
  ];

  return (
    <Dialog overlay={false} open={open} onOpenChange={onClose}>
      {/* wrapper div here prevents radix 'getComputedStyle' TypeError */}
      <StyledOverlay
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        onTouchMove={handleDragging}
      />
      <Box>
        <Draggable
          position={dragPos ? dragPos : undefined}
          nodeRef={nodeRef}
          axis="y"
          handle=".drag-handle"
          bounds={{ left: 0, top: 0, right: 0, bottom: 400 }}
        >
          <StyledDialogContent
            css={{
              overflowX: 'hidden',
              px: 0,
              paddingBottom: 0,
              bottom: '-25%',
              overflowY: 'hidden',
            }}
            className="dialog-content"
            ref={nodeRef}
            closeButton={false}
          >
            <DragHandleArea
              onTouchStart={handleDragStart}
              onTouchEnd={handleDragEnd}
              onTouchMove={handleDragging}
            >
              <DragHandleBar
                className="handleLeft"
                css={{
                  mr: 27,
                  transform: 'rotate(-15deg)',
                }}
              />
              <DragHandleBar
                className="handleRight"
                css={{
                  ml: 27,
                  transform: 'rotate(15deg)',
                }}
              />
            </DragHandleArea>
            {upperNavItems.map(({ name, path, icon: Icon }) => (
              <Link
                key={name}
                href={path}
                as={path === '/[username]' ? `/${user?.username}` : undefined}
                passHref
                legacyBehavior
              >
                <StyledDialogItem
                  onTouchStart={handleDragStart}
                  onTouchEnd={handleDragEnd}
                  onTouchMove={handleDragging}
                  as="a"
                >
                  <Flex align="center" gap="2">
                    <Icon />
                    {name}
                  </Flex>
                </StyledDialogItem>
              </Link>
            ))}
            <Box css={{ height: 1, backgroundColor: '$gray6', mx: '-$5' }} />
            {lowerNavItems.map((item) => (
              <Link key={item.name} href={item.path} passHref legacyBehavior>
                <StyledDialogItem
                  onTouchStart={handleDragStart}
                  onTouchEnd={handleDragEnd}
                  onTouchMove={handleDragging}
                  className="dialog-item"
                  color="gray"
                  as="a"
                >
                  {item.name}
                </StyledDialogItem>
              </Link>
            ))}
            <StyledDialogItem
              onTouchStart={handleDragStart}
              onTouchEnd={handleDragEnd}
              onTouchMove={handleDragging}
              color="gray"
              onClick={handleThemeToggle}
            >
              Dark mode
              <Switch checked={resolvedTheme === 'dark'}>
                <SwitchThumb />
              </Switch>
            </StyledDialogItem>
            <Box css={{ height: 1, backgroundColor: '$gray6', mx: '-$5' }} />
            <StyledDialogItem
              onTouchStart={handleDragStart}
              onTouchEnd={handleDragEnd}
              onTouchMove={handleDragging}
              color="gray"
              onClick={handleLogout}
            >
              Logout
            </StyledDialogItem>
          </StyledDialogContent>
        </Draggable>
      </Box>
    </Dialog>
  );
};
