import React, { createRef, useEffect } from 'react';
import styled, { css } from 'styled-components/macro';
import tw from 'tailwind.macro';
import { Link } from '../../../components';

const containerSize = 220;

const Backdrop = styled.div<{ open: boolean }>`
  ${tw`fixed left-0 top-0 bottom-0 right-0 invisible`};
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s ease;
  opacity: 0;
  z-index: 1;

  ${props =>
    props.open &&
    css`
      ${tw`visible`};
      opacity: 1;
    `}
`;

const Container = styled.div<{ open: boolean }>`
  ${tw`fixed left-0 top-0 bottom-0 bg-grey-light z-10 py-4`};
  width: ${containerSize}px;
  max-width: 100%;
  transition: transform 0.3s ease;
  transform: translate3d(-${containerSize}px, 0, 0);

  ${props =>
    props.open &&
    css`
      transform: translateZ(0);
    `}
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
  // TODO type
  user: any;
  userImage?: string;
  onClose: () => void;
  onLogin: () => void;
}

export const MobileMenu = ({
  open,
  user,
  userImage,
  onClose,
  onLogin,
}: MobileMenuProps) => {
  const nodeRef = createRef<HTMLDivElement>();

  /**
   * Handle click outside menu
   */
  const handleClick = (e: any) => {
    if (nodeRef.current && !nodeRef.current.contains(e.target)) {
      onClose();
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open]);

  return (
    <React.Fragment>
      <Backdrop open={open} />
      <Container ref={nodeRef} open={open}>
        <MobileMenuLogo src="/static/images/logo.png" alt="Sigle logo" />

        {user && <MobileMenuImage alt={user.username} src={userImage} />}

        <ul>
          <MobileMenuListItem>
            <MobileMenuLink href="/discover">Discover</MobileMenuLink>
          </MobileMenuListItem>
          {user && (
            <MobileMenuListItem>
              <MobileMenuLink href="/me">My stories</MobileMenuLink>
            </MobileMenuListItem>
          )}
          {/* <MobileMenuListItem>
            <MobileMenuLink href="#">How to use?</MobileMenuLink>
          </MobileMenuListItem> */}
          {!user && (
            <MobileMenuListItem>
              <MobileMenuLink href="" onClick={onLogin}>
                Sign in
              </MobileMenuLink>
            </MobileMenuListItem>
          )}
        </ul>
      </Container>
    </React.Fragment>
  );
};
