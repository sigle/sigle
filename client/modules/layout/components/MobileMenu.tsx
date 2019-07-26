import React from 'react';
import styled from 'styled-components/macro';
import tw from 'tailwind.macro';
import '@reach/dialog/styles.css';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { Link } from '../../../components';

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

const MobileMenuLink = styled(Link)`
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
}

// TODO animation when open / close the menu
export const MobileMenu = ({
  open,
  user,
  userImage,
  onClose,
  onLogin,
}: MobileMenuProps) => {
  return (
    <StyledDialogOverlay isOpen={open} onDismiss={onClose}>
      <StyledDialogContent>
        <MobileMenuLogo src="/static/images/logo.png" alt="Sigle logo" />

        {user && <MobileMenuImage alt={user.username} src={userImage} />}

        <ul>
          <MobileMenuListItem>
            <MobileMenuLink href="/discover">Discover</MobileMenuLink>
          </MobileMenuListItem>
          {user && (
            <>
              <MobileMenuListItem>
                <MobileMenuLink href="/me">My stories</MobileMenuLink>
              </MobileMenuListItem>
              <MobileMenuListItem>
                <MobileMenuLink
                  href="https://app-center.openintents.org/appco/1092/review"
                  rel="noopener noreferrer"
                >
                  Rate App!
                </MobileMenuLink>
              </MobileMenuListItem>
            </>
          )}
          {!user && (
            <MobileMenuListItem>
              <MobileMenuLink href="" onClick={onLogin}>
                Sign in
              </MobileMenuLink>
            </MobileMenuListItem>
          )}
        </ul>
      </StyledDialogContent>
    </StyledDialogOverlay>
  );
};
