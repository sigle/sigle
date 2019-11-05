import React from 'react';
import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';
import { MdClose, MdAddAPhoto, MdDelete } from 'react-icons/md';
import { Story } from '../../../types';
import { Button } from '../../../components';

const containerSize = 450;

const Container = styled.div<{ open: boolean }>`
  ${tw`fixed right-0 top-0 bottom-0 bg-grey-light z-10 px-8 pb-8 overflow-y-auto`};
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
  ${tw`absolute bottom-0 right-0 p-2 flex items-center text-grey-dark`};
`;

const Image = styled.img`
  ${tw`cursor-pointer w-full`};
`;

const FormRow = styled.div`
  ${tw`py-3`};
`;

const FormLabel = styled.label`
  ${tw`w-full block tracking-wide font-bold text-black mb-2`};
`;

const FormInput = styled.input`
  ${tw`appearance-none block w-full bg-white border border-grey rounded py-3 px-3 text-sm leading-tight focus:outline-none`};
`;

const FormTextarea = styled.textarea`
  ${tw`appearance-none block w-full bg-white border border-grey rounded py-3 px-3 text-sm leading-tight focus:outline-none`};
`;

const FormHelper = styled.p`
  ${tw`text-sm text-grey-darker mt-1`};
`;

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
  onChangeMetaTitle: (value: string) => void;
  onChangeMetaDescription: (value: string) => void;
  onUploadImage: () => void;
  nodeRef: React.RefObject<HTMLDivElement>;
}

export const StorySettings = ({
  open,
  onClose,
  story,
  loadingDelete,
  onDelete,
  onChangeMetaTitle,
  onChangeMetaDescription,
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

      <form>
        <FormRow>
          <FormLabel>Cover image</FormLabel>
          {!story.coverImage && (
            <ImageEmpty onClick={onUploadImage}>
              <span>Upload cover image</span>
              <ImageEmptyIcon>
                <MdAddAPhoto />
              </ImageEmptyIcon>
            </ImageEmpty>
          )}
          {story.coverImage && (
            <Image src={story.coverImage} onClick={onUploadImage} />
          )}
        </FormRow>

        <FormRow>
          <FormLabel>Meta title</FormLabel>
          <FormInput
            value={story.metaTitle || ''}
            onChange={e => onChangeMetaTitle(e.target.value)}
            maxLength={100}
          />
          <FormHelper>
            Recommended: 70 characters. You have used{' '}
            {story.metaTitle ? story.metaTitle.length : 0} characters.
          </FormHelper>
        </FormRow>

        <FormRow>
          <FormLabel>Meta description</FormLabel>
          <FormTextarea
            rows={3}
            value={story.metaDescription || ''}
            onChange={e => onChangeMetaDescription(e.target.value)}
            maxLength={250}
          />
          <FormHelper>
            Recommended: 156 characters. You have used{' '}
            {story.metaDescription ? story.metaDescription.length : 0}{' '}
            characters.
          </FormHelper>
        </FormRow>
      </form>

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
