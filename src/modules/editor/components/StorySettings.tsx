import React from 'react';
import styled, { css } from 'styled-components/macro';
import tw from 'tailwind.macro';
import { MdClose, MdAddAPhoto, MdDelete } from 'react-icons/md';
import { Story } from '../../../types';

const containerSize = 450;

const Container = styled.div<{ open: boolean }>`
  ${tw`fixed pin-r pin-t pin-b bg-grey-light z-10 px-8 pb-8`};
  width: ${containerSize}px;
  max-width: 100%;
  transition: transform 0.3s ease;
  transform: translate3d(${containerSize}px, 0, 0);

  ${props =>
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
  ${tw`p-2 -mr-2 flex items-center cursor-pointer`};
`;

const ImageEmpty = styled.div`
  ${tw`flex items-center justify-center bg-white py-16 mb-4 cursor-pointer rounded-lg relative border border-solid border-grey`};

  span {
    ${tw`py-1 px-2 rounded-lg text-sm border border-solid border-grey-dark text-grey-dark`};
  }
`;

const ImageEmptyIcon = styled.div`
  ${tw`absolute pin-b pin-r p-2 flex items-center text-grey-dark`};
`;

const Image = styled.img`
  ${tw`mb-4 cursor-pointer`};
  max-width: 100%;
`;

const Label = styled.div`
  ${tw`mb-2 text-sm`};
`;

// const Input = styled.input`
//   ${tw`mb-2 pb-1 bg-transparent border-b border-solid border-black w-full text-sm`};
//   &:focus {
//     outline: 0;
//   }
// `;

const ButtonLink = styled.button`
  ${tw`flex items-center text-pink text-sm mt-2`};
  &:focus {
    outline: 0;
  }

  span {
    ${tw`ml-1`};
  }
`;

interface Props {
  story: Story;
  open: boolean;
  onClose: () => void;
  loadingDelete: boolean;
  onDelete: () => void;
  onUploadImage: () => void;
  nodeRef: React.RefObject<HTMLDivElement>;
}

export const StorySettings = ({
  open,
  onClose,
  story,
  loadingDelete,
  onDelete,
  onUploadImage,
  nodeRef,
}: Props) => {
  return (
    <Container open={open} ref={nodeRef}>
      <TitleContainer>
        <Title>Settings</Title>
        <CloseButton onClick={onClose}>
          <MdClose />
        </CloseButton>
      </TitleContainer>

      <Label>Cover image:</Label>
      {!story.coverImage && (
        <ImageEmpty onClick={onUploadImage}>
          <span>Upload story image</span>
          <ImageEmptyIcon>
            <MdAddAPhoto />
          </ImageEmptyIcon>
        </ImageEmpty>
      )}
      {story.coverImage && (
        <Image src={story.coverImage} onClick={onUploadImage} />
      )}

      {/* <Label>Story URL:</Label>
      <Input type="text" value={story.id} />

      <Label>Excerpt:</Label>
      <Input type="text" value={story.content} /> */}

      {loadingDelete ? (
        <ButtonLink disabled>
          <MdDelete />
          <span>Deleting ...</span>
        </ButtonLink>
      ) : (
        <ButtonLink onClick={onDelete}>
          <MdDelete />
          <span>Delete this story</span>
        </ButtonLink>
      )}
    </Container>
  );
};
