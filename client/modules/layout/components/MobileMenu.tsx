import React, { useState } from 'react';
import styled from 'styled-components/macro';
import tw from 'tailwind.macro';
import '@reach/dialog/styles.css';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import Link from 'next/link';
import { useSpring, animated } from 'react-spring';
import { getProfileRoute, getSettingsRoute } from '../../../utils/routes';

const StyledDialogOverlay = styled(DialogOverlay)`
  z-index: 11;
`;

const StyledDialogContent = styled(DialogContent)`
  ${tw`absolute top-0 left-0 bottom-0 w-full m-0 px-0 py-4 bg-white overflow-auto`};
  width: 220px;
`;

const MobileMenuLogo = styled.img`
  ${tw`mx-auto mb-6`};
  height: 30px;
`;

const MobileMenuImage = styled.img`
  ${tw`w-16 h-16 rounded-full mx-auto mb-6`};
`;

const MobileMenuListItem = styled.li`
  ${tw`border-b border-grey`};
  &:first-child {
    ${tw`border-t`};
  }
`;

const MobileMenuLink = styled.a`
  ${tw`text-center block py-3`};
`;

interface MobileMenuProps {
  open: boolean;
  user?: {
    username: string;
  };
  userImage?: string;
  onClose: () => void;
  onLogin: () => void;
  onLogout: () => void;
}

// TODO animation when open / close the menu
export const MobileMenu = ({
  open,
  user,
  userImage,
  onClose,
  onLogin,
  onLogout,
}: MobileMenuProps) => {
  const [delayedOpen, setDelayedOpen] = useState(open);
  const overlayStyle = useSpring({
    opacity: open ? 1 : 0,
    config: { duration: 200 },
    onRest: () => setDelayedOpen(open),
  });
  const contentStyle = useSpring({
    transform: open ? 'translate3d(0px,0,0)' : 'translate3d(-80px,0,0)',
    config: { duration: 180 },
  });

  const profileRoute = user && getProfileRoute({ username: user.username });
  const settingsRoute = getSettingsRoute();

  const AnimatedDialogOverlay = animated(StyledDialogOverlay);
  const AnimatedDialogContent = animated(StyledDialogContent);

  return (
    <AnimatedDialogOverlay
      style={overlayStyle}
      isOpen={open || delayedOpen}
      onDismiss={onClose}
    >
      <AnimatedDialogContent style={contentStyle}>
        <MobileMenuLogo src="/static/images/logo.png" alt="Sigle logo" />

        {user && <MobileMenuImage alt={user.username} src={userImage} />}

        <ul>
          <MobileMenuListItem>
            <Link href="/discover">
              <MobileMenuLink>Discover</MobileMenuLink>
            </Link>
          </MobileMenuListItem>
          {user && profileRoute && (
            <React.Fragment>
              <MobileMenuListItem>
                <Link href="/me">
                  <MobileMenuLink>My stories</MobileMenuLink>
                </Link>
              </MobileMenuListItem>
              <MobileMenuListItem>
                <Link href={profileRoute.href} as={profileRoute.as}>
                  <MobileMenuLink>Profile</MobileMenuLink>
                </Link>
              </MobileMenuListItem>
              <MobileMenuListItem>
                <Link href={settingsRoute.href} as={settingsRoute.as}>
                  <MobileMenuLink>Settings</MobileMenuLink>
                </Link>
              </MobileMenuListItem>
              <MobileMenuListItem>
                <MobileMenuLink
                  href=""
                  onClick={e => {
                    e.preventDefault();
                    onLogout();
                  }}
                >
                  Sign out
                </MobileMenuLink>
              </MobileMenuListItem>
            </React.Fragment>
          )}

          {!user && (
            <MobileMenuListItem>
              <MobileMenuLink
                href=""
                onClick={e => {
                  e.preventDefault();
                  onLogin();
                  onClose();
                }}
              >
                Sign in
              </MobileMenuLink>
            </MobileMenuListItem>
          )}
        </ul>
      </AnimatedDialogContent>
    </AnimatedDialogOverlay>
  );
};
