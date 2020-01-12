import React from 'react';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { ButtonOutline } from '.';

const StyledDialogOverlay = styled(DialogOverlay)`
  background: rgba(255, 255, 255, 0.95);
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
  onConfirm: () => void;
  onCancel: () => void;
}

export const FullScreenDialog = ({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  confirmTitle = 'Confirm',
  cancelTitle = 'Cancel',
}: FullScreenDialogProps) => {
  return (
    <StyledDialogOverlay isOpen={isOpen} onDismiss={onCancel}>
      <StyledDialogContent aria-label={title}>
        <Container>
          <Title>{title}</Title>
          <Description>{description}</Description>
          <ButtonsContainer>
            <ButtonOutline onClick={onCancel}>{cancelTitle}</ButtonOutline>
            <ButtonOutline style={{ marginLeft: 12 }} onClick={onConfirm}>
              {confirmTitle}
            </ButtonOutline>
          </ButtonsContainer>
        </Container>
      </StyledDialogContent>
    </StyledDialogOverlay>
  );
};
