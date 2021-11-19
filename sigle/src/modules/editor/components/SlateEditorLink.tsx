import React, { useEffect } from 'react';
import { useFormik, FormikErrors } from 'formik';
import { Editor } from 'slate-react';
import {
  FormRow,
  FormLabel,
  FormInput,
  FormHelperError,
} from '../../../components/Form';
import {
  Button,
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  Flex,
  Heading,
} from '../../../ui';

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
      let link = values.link;
      if (link && !link.startsWith('http') && !link.startsWith('#')) {
        link = `http://${link}`;
      }
      onConfirmEditLink({ text: values.text, link });
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent aria-label="Edit link">
        <DialogTitle asChild>
          <Heading as="h2" size="2xl">
            Edit link
          </Heading>
        </DialogTitle>

        <form onSubmit={formik.handleSubmit}>
          <FormRow>
            <FormLabel>Text</FormLabel>
            <FormInput
              name="text"
              value={formik.values.text}
              onChange={formik.handleChange}
              maxLength={120}
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
              maxLength={120}
            />
            {formik.errors.link && (
              <FormHelperError>{formik.errors.link}</FormHelperError>
            )}
          </FormRow>

          <Flex justify="end" gap="6" css={{ mt: '$5' }}>
            <DialogClose asChild>
              <Button size="lg" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button
              disabled={formik.isSubmitting}
              size="lg"
              color="orange"
              type="submit"
            >
              {formik.isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </Flex>
        </form>
      </DialogContent>
    </Dialog>
  );
};
