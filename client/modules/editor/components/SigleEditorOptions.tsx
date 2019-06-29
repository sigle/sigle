import React, { useState } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import '@reach/dialog/styles.css';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { MdClose, MdAddAPhoto } from 'react-icons/md';
import { toast } from 'react-toastify';
import { Button } from '../../../components';

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

const FormButton = styled(Button)`
  ${tw`mt-4`};
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

const MetaUrlPreview = styled.div`
  font-size: 14px;
  padding-top: 1px;
  line-height: 1.43;
  color: #006621;
`;

const MetaDescriptionPreview = styled.div`
  font-size: 14px;
  line-height: 1.54;
  word-wrap: break-word;
  color: #545454;
`;

interface Props {
  story: any;
  optionsOpen: boolean;
  onChangeOptionsOpen: (open: boolean) => void;
}

// TODO if close the modal with changes unsaved warm the user
export const SigleEditorOptions = ({
  story,
  optionsOpen,
  onChangeOptionsOpen,
}: Props) => {
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  // TODO change this really ugly hack
  const [fakeStory, setFakeStory] = useState<any>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveLoading(true);

    try {
      await story.save();
      toast.success('Settings changed successfully');
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }

    setSaveLoading(false);
  };
  return (
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

        <form onSubmit={handleSubmit}>
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
            <FormTextarea
              value={story.attrs.excerpt || ''}
              rows={3}
              onChange={e => {
                const update = {
                  excerpt: e.target.value,
                };
                story.update(update);
                setFakeStory(update);
              }}
            />
          </FormRow>

          <FormRow>
            <FormLabel>Meta title</FormLabel>
            <FormInput
              value={story.attrs.metaTitle || ''}
              onChange={e => {
                const update = {
                  metaTitle: e.target.value,
                };
                story.update(update);
                setFakeStory(update);
              }}
            />
            <FormHelper>Recommended: 70 characters.</FormHelper>
          </FormRow>

          <FormRow>
            <FormLabel>Meta description</FormLabel>
            <FormTextarea
              rows={3}
              value={story.attrs.metaDescription || ''}
              onChange={e => {
                const update = {
                  metaDescription: e.target.value,
                };
                story.update(update);
                setFakeStory(update);
              }}
            />
            <FormHelper>Recommended: 156 characters.</FormHelper>
          </FormRow>

          <FormRow>
            <MetaTitlePreview>
              {story.attrs.metaTitle || story.attrs.title}
            </MetaTitlePreview>
            <MetaUrlPreview>https://sigle.io/toto</MetaUrlPreview>
            <MetaDescriptionPreview>
              {story.attrs.metaDescription || story.attrs.excerpt}
            </MetaDescriptionPreview>
          </FormRow>

          <FormButton color="primary" disabled={saveLoading}>
            {saveLoading ? 'Saving...' : 'Save'}
          </FormButton>
        </form>
      </StyledDialogContent>
    </StyledDialogOverlay>
  );
};
