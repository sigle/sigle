import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { keyframes, styled } from '../../../stitches.config';
import { Box, Dialog, DialogContent } from '../../../ui';
import { Switch, SwitchThumb } from '../../../ui/Switch';
import { userSession } from '../../../utils/blockstack';
import { useQueryClient } from 'react-query';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { useRef } from 'react';
import { useMotionAnimate } from 'motion-hooks';

const DragHandleArea = styled('div', {
  width: 128,
  position: 'absolute',
  display: 'grid',
  placeItems: 'center',
  top: 0,
  left: 0,
  right: 0,
  mx: 'auto',
  p: '$5',
});

const DragHandleBar = styled('div', {
  width: 64,
  height: 6,
  br: '$1',
  backgroundColor: '$gray8',
});

const StyledDialogItem = styled('div', {
  p: '$5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  userSelect: 'none',
  cursor: 'pointer',

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
  maxHeight: 'fit-content',
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
});

interface MobileHeaderProps {
  open: boolean;
  onClose: () => void;
}

interface DragPosProps {
  x: number;
  y: number;
}

export const MobileHeader = ({ open, onClose }: MobileHeaderProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  // give target element a ref to avoid 'findDOMNode' deprecation error - https://blog.logrocket.com/create-draggable-components-react-draggable/#:~:text=Handling%20the%C2%A0findDOMNode%20deprecation%20error
  const nodeRef = useRef(null);
  const { play: exitAnimation } = useMotionAnimate(
    nodeRef,
    {
      transform: `matrix(1, 0, 0, 1, 0, 600)`,
    },
    {
      duration: 0.5,
    }
  );
  const { play: canceledAnimation } = useMotionAnimate(
    nodeRef,
    {
      transform: `matrix(1, 0, 0, 1, 0, 0)`,
    },
    {
      duration: 0.5,
    }
  );

  const overlayShow = keyframes({
    '0%': { transform: `matrix(1, 0, 0, 1, 0, 300)` },
    '100%': { transform: `matrix(1, 0, 0, 1, 0, 0)` },
  });

  const handleThemeToggle = () => {
    resolvedTheme === 'dark' ? setTheme('light') : setTheme('dark');
  };

  const handleLogout = () => {
    queryClient.removeQueries();
    userSession.signUserOut();
    signOut();
  };

  const handleDragStop = (e: DraggableEvent, data: DraggableData) => {
    if (data.y >= 200) {
      exitAnimation();
      setTimeout(onClose, 300);
    } else {
      canceledAnimation();
    }
  };

  const upperNavItems = [
    {
      name: 'Feed',
      path: '/feed',
    },
    {
      name: 'Explore',
      path: '/explore',
    },
  ];

  const lowerNavItems = [
    {
      name: 'Settings',
      path: '/settings',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* wrapper div here prevents radix 'getComputedStyle' TypeError */}
      <Box>
        <Draggable
          nodeRef={nodeRef}
          axis="y"
          handle=".drag-handle"
          bounds={{ left: 0, top: 0, right: 0, bottom: 400 }}
          onStop={handleDragStop}
        >
          <StyledDialogContent
            css={{
              '@media (prefers-reduced-motion: no-preference)': {
                animation: `${overlayShow} 500ms cubic-bezier(0.16, 1, 0.3, 1)`,
              },
            }}
            className="dialog-content"
            ref={nodeRef}
            closeButton={false}
          >
            <DragHandleArea className="drag-handle">
              <DragHandleBar />
            </DragHandleArea>
            {upperNavItems.map((item) => (
              <Link key={item.name} href={item.path} passHref>
                <StyledDialogItem as="a">{item.name}</StyledDialogItem>
              </Link>
            ))}
            <Box css={{ height: 1, backgroundColor: '$gray6', mx: '-$5' }} />
            {lowerNavItems.map((item) => (
              <Link key={item.name} href={item.path} passHref>
                <StyledDialogItem color="gray" as="a">
                  {item.name}
                </StyledDialogItem>
              </Link>
            ))}
            <StyledDialogItem color="gray" onClick={handleThemeToggle}>
              Dark mode
              <Switch checked={resolvedTheme === 'dark'}>
                <SwitchThumb />
              </Switch>
            </StyledDialogItem>
            <Box css={{ height: 1, backgroundColor: '$gray6', mx: '-$5' }} />
            <StyledDialogItem color="gray" onClick={handleLogout}>
              Logout
            </StyledDialogItem>
          </StyledDialogContent>
        </Draggable>
      </Box>
    </Dialog>
  );
};
