import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import '@reach/dialog/styles.css';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { MdClose, MdAddAPhoto } from 'react-icons/md';

const StyledDialogOverlay = styled(DialogOverlay)`
  z-index: 11;
`;

const StyledDialogContent = styled(DialogContent)`
  ${tw`absolute top-0 right-0 bottom-0 w-full max-w-md m-0 px-8 py-4 bg-white overflow-auto`};
`;

const TitleContainer = styled.div`
  ${tw`pb-4 flex justify-between items-center`};
`;

const Title = styled.div`
  ${tw`text-2xl`};
`;

const CloseButton = styled.div`
  ${tw`p-2 -mr-2 flex items-center cursor-pointer`};
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
  ${tw`text-sm text-grey-darker`};
`;

const ImageEmpty = styled.div`
  ${tw`flex items-center justify-center bg-grey py-16 mb-4 cursor-pointer rounded-lg relative border border-solid border-grey`};

  span {
    ${tw`py-1 px-2 text-sm text-grey-darker`};
  }
`;

const ImageEmptyIcon = styled.div`
  ${tw`absolute bottom-0 right-0 p-2 flex items-center text-grey-darker`};
`;

const MetaTitlePreview = styled.div`
  font-size: 18px;
  line-height: 1.33;
  color: #1a0dab;
`;

const MetaDescriptionPreview = styled.div`
  font-size: 14px;
  padding-top: 1px;
  line-height: 1.43;
  color: #006621;
`;

interface Props {
  story: any;
  optionsOpen: boolean;
  onChangeOptionsOpen: (open: boolean) => void;
}

export const SigleEditorOptions = ({
  story,
  optionsOpen,
  onChangeOptionsOpen,
}: Props) => (
  <StyledDialogOverlay
    isOpen={optionsOpen}
    onDismiss={() => onChangeOptionsOpen(false)}
  >
    <StyledDialogContent>
      <TitleContainer>
        <Title>Settings</Title>
        <CloseButton onClick={() => onChangeOptionsOpen(false)}>
          <MdClose />
        </CloseButton>
      </TitleContainer>

      <FormRow>
        <ImageEmpty>
          <span>Upload cover image</span>
          <ImageEmptyIcon>
            <MdAddAPhoto />
          </ImageEmptyIcon>
        </ImageEmpty>
      </FormRow>

      <FormRow>
        <FormLabel>Excerpt</FormLabel>
        <FormTextarea value={story.excerpt} rows={3} />
      </FormRow>

      <FormRow>
        <FormLabel>Meta title</FormLabel>
        <FormInput />
        <FormHelper>Recommended: 70 characters.</FormHelper>
      </FormRow>

      <FormRow>
        <FormLabel>Meta description</FormLabel>
        <FormTextarea value={story.excerpt} rows={3} />
        <FormHelper>Recommended: 156 characters.</FormHelper>
      </FormRow>

      <FormRow>
        <MetaTitlePreview>Meta title</MetaTitlePreview>
        <MetaDescriptionPreview>https://sigle.io/toto</MetaDescriptionPreview>
      </FormRow>
    </StyledDialogContent>
  </StyledDialogOverlay>
);
