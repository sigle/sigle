import React from 'react';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import styled, { keyframes } from 'styled-components';
import tw from 'twin.macro';
import { ButtonOutline } from '.';

const overlayAnimation = keyframes`
  0% {
    transform: scale(.9);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const StyledDialogOverlay = styled(DialogOverlay)`
  background: rgba(255, 255, 255, 0.95);
  animation: ${overlayAnimation} 75ms cubic-bezier(0, 0, 0.2, 1);
`;

const StyledDialogContent = styled(DialogContent)`
  ${tw`bg-transparent h-screen p-0 m-auto w-full flex justify-center items-center`};
`;

const Container = styled.div`
  ${tw`text-center`};
`;

const Title = styled.h2`
  ${tw`text-3xl font-bold`};
`;

const Description = styled.div`
  ${tw`mt-2`};
`;

const ButtonsContainer = styled.div`
  ${tw`mt-4`};
`;

interface FullScreenDialogProps {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  confirmTitle?: string;
  cancelTitle?: string;
  confirmLoading?: boolean;
  loadingTitle?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const FullScreenDialog = ({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLoading,
  loadingTitle = 'Loading ...',
  confirmTitle = 'Confirm',
  cancelTitle = 'Cancel',
}: FullScreenDialogProps) => {
  return (
    <StyledDialogOverlay isOpen={isOpen} onDismiss={onCancel}>
      <StyledDialogContent aria-label={title}>
        {!confirmLoading ? (
          <Container>
            <Title>{title}</Title>
            <Description>{description}</Description>
            <ButtonsContainer>
              <ButtonOutline onClick={onCancel} disabled={confirmLoading}>
                {cancelTitle}
              </ButtonOutline>
              <ButtonOutline
                style={{ marginLeft: 12 }}
                onClick={onConfirm}
                disabled={confirmLoading}
              >
                {confirmTitle}
              </ButtonOutline>
            </ButtonsContainer>
          </Container>
        ) : (
          <Container>
            <Title>{loadingTitle}</Title>
          </Container>
        )}
      </StyledDialogContent>
    </StyledDialogOverlay>
  );
};
