import React from 'react';
import styled, { css } from 'styled-components/macro';
import tw from 'tailwind.macro';
import { MdClose } from 'react-icons/md';
import { ButtonOutline } from '../../../components';
import { Story } from '../../../types';

const Container = styled.div`
  ${tw`absolute pin-r pin-t pin-b bg-grey-lightest z-10 px-8 pb-8`};
  width: 500px;
  max-width: 100%;
  transition: transform 0.3s ease;
  transform: translate3d(500px, 0, 0);

  ${(props: any) =>
    props.open &&
    css`
      transform: translateZ(0);
    `}
`;

const TitleContainer = styled.div`
  ${tw`py-4 flex justify-between items-center`};
`;

const Title = styled.div`
  ${tw`text-2xl`};
  font-family: 'Libre Baskerville', serif;
`;

const CloseButton = styled.div`
  ${tw`p-2 flex items-center cursor-pointer`};
`;

interface Props {
  story: Story;
  open: boolean;
  onClose: () => void;
  loadingDelete: boolean;
  onDelete: () => void;
}

export const StorySettings = ({
  open,
  onClose,
  loadingDelete,
  onDelete,
}: Props) => {
  return (
    <Container open={open}>
      <TitleContainer>
        <Title>Settings</Title>
        <CloseButton onClick={onClose}>
          <MdClose />
        </CloseButton>
      </TitleContainer>

      {loadingDelete && <ButtonOutline disabled>Deleting ...</ButtonOutline>}
      {!loadingDelete && (
        <ButtonOutline onClick={onDelete}>Delete</ButtonOutline>
      )}
    </Container>
  );
};
