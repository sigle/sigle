import React, { useEffect } from 'react';
import { DialogContent, DialogOverlay } from '@reach/dialog';
import { useFormik, FormikErrors } from 'formik';
import styled, { keyframes } from 'styled-components';
import tw from 'twin.macro';
import { Editor } from 'slate-react';
import {
  FormRow,
  FormLabel,
  FormInput,
  FormHelperError,
} from '../../../components/Form';
import { Button } from '../../../components';

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
  animation: ${overlayAnimation} 75ms cubic-bezier(0, 0, 0.2, 1);
  z-index: 11;
`;

const StyledDialogContent = styled(DialogContent)`
  ${tw`max-w-lg w-full p-8`}
`;

const Title = styled.h2`
  ${tw`text-2xl mb-4`};
`;

const SaveRow = styled.div`
  ${tw`pt-3 flex justify-end`};
`;

const CancelButton = styled(Button)`
  ${tw`mr-4`};
`;

interface SlateEditorLinkFormValues {
  text: string;
  link: string;
}

interface SlateEditorLinkProps {
  editor: Editor;
  open: boolean;
  onClose: () => void;
  onConfirmEditLink: (values: SlateEditorLinkFormValues) => void;
}

export const SlateEditorLink = ({
  editor,
  open,
  onClose,
  onConfirmEditLink,
}: SlateEditorLinkProps) => {
  const { value } = editor;

  const formik = useFormik<SlateEditorLinkFormValues>({
    initialValues: {
      text: '',
      link: '',
    },
    validate: (values) => {
      const errors: FormikErrors<SlateEditorLinkFormValues> = {};
      if (!values.text) {
        errors.text = 'Text is required';
      }
      return errors;
    },
    onSubmit: (values) => {
      onConfirmEditLink(values);
    },
  });

  // Every time the modal is opened we init the form with the selected text values
  useEffect(() => {
    if (open) {
      const inline = value.inlines.find((inline) => inline?.type === 'link');
      formik.resetForm({
        values: {
          text: value.fragment.text || '',
          link: inline?.data.get('href') || '',
        },
      });
    }
  }, [open]);

  return (
    <StyledDialogOverlay isOpen={open} onDismiss={onClose}>
      <StyledDialogContent aria-label="Edit link">
        <Title>Edit link</Title>
        <form onSubmit={formik.handleSubmit}>
          <FormRow>
            <FormLabel>Text</FormLabel>
            <FormInput
              name="text"
              value={formik.values.text}
              onChange={formik.handleChange}
              maxLength={100}
            />
            {formik.errors.text && (
              <FormHelperError>{formik.errors.text}</FormHelperError>
            )}
          </FormRow>

          <FormRow>
            <FormLabel>Link</FormLabel>
            <FormInput
              name="link"
              value={formik.values.link}
              onChange={formik.handleChange}
              maxLength={100}
            />
            {formik.errors.link && (
              <FormHelperError>{formik.errors.link}</FormHelperError>
            )}
          </FormRow>

          <SaveRow>
            <CancelButton
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
            >
              Cancel
            </CancelButton>
            <Button disabled={formik.isSubmitting} type="submit">
              {formik.isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </SaveRow>
        </form>
      </StyledDialogContent>
    </StyledDialogOverlay>
  );
};
