import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import '@reach/dialog/styles.css';
import { DialogOverlay, DialogContent } from '@reach/dialog';

const StyledDialogOverlay = styled(DialogOverlay)`
  z-index: 11;
`;

const StyledDialogContent = styled(DialogContent)`
  ${tw`absolute top-0 right-0 bottom-0 w-full max-w-md m-0 px-8 py-4 bg-grey-light`};
`;

const Title = styled.div`
  ${tw`text-2xl`};
`;

interface Props {
  optionsOpen: boolean;
  onChangeOptionsOpen: (open: boolean) => void;
}

export const SigleEditorOptions = ({
  optionsOpen,
  onChangeOptionsOpen,
}: Props) => (
  <StyledDialogOverlay
    isOpen={optionsOpen}
    onDismiss={() => onChangeOptionsOpen(false)}
  >
    <StyledDialogContent>
      <Title>Settings</Title>
    </StyledDialogContent>
  </StyledDialogOverlay>
);
