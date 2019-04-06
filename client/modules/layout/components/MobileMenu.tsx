import React, { createRef, useEffect } from 'react';
import styled, { css } from 'styled-components/macro';
import tw from 'tailwind.macro';

const containerSize = 220;

const Backdrop = styled.div<{ open: boolean }>`
  ${tw`fixed left-0 top-0 bottom-0 right-0 invisible`};
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s ease;
  opacity: 0;

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

const MobileMenuLink = styled.a`
  ${tw`text-center block py-3`};
`;

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export const MobileMenu = ({ open, onClose }: MobileMenuProps) => {
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

        {/* <MobileMenuImage
        alt="Profile image of TODO"
        src="https://source.unsplash.com/random/100x100"
      /> */}

        <ul>
          <MobileMenuListItem>
            <MobileMenuLink href="#">Discover</MobileMenuLink>
          </MobileMenuListItem>
          {/* <MobileMenuListItem>
          <MobileMenuLink href="#">My stories</MobileMenuLink>
        </MobileMenuListItem> */}
          <MobileMenuListItem>
            <MobileMenuLink href="#">How to use?</MobileMenuLink>
          </MobileMenuListItem>
          <MobileMenuListItem>
            <MobileMenuLink href="#">Contact</MobileMenuLink>
          </MobileMenuListItem>
          <MobileMenuListItem>
            <MobileMenuLink href="#">Sign in</MobileMenuLink>
          </MobileMenuListItem>
        </ul>
      </Container>
    </React.Fragment>
  );
};
