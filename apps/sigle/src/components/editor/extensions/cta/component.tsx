import React, { useEffect, useState } from 'react';
import { NodeViewProps } from '@tiptap/core';
import { NodeViewWrapper } from '@tiptap/react';
import {
  Button,
  Dialog,
  Flex,
  RadioGroup,
  Text,
  TextField,
} from '@radix-ui/themes';
import { FormikErrors, useFormik } from 'formik';
import { isValidHttpUrl } from '../../../../utils';
import { useGetUserSettings } from '../../../../hooks/appData';
import { getContrastingColor } from '../../../../utils/colors';
import { cn } from '@/lib/cn';

interface CtaFormValues {
  label: string;
  url: string;
  size: 'sm' | 'md' | 'lg';
}

export const CtaComponent = (props: NodeViewProps) => {
  const [showCtatDialog, setShowCtaDialog] = useState(false);
  const handleCancelCtaDialog = () => setShowCtaDialog(false);
  const { data: settings } = useGetUserSettings();

  const label = props.node.attrs.label;
  const url = props.node.attrs.url;
  const size = props.node.attrs.size;

  const hasAttrs = label && size && url;

  useEffect(() => {
    if (!hasAttrs) {
      setShowCtaDialog(true);
    }
  }, []);

  // TODO stop using formik
  const formik = useFormik<CtaFormValues>({
    initialValues: {
      label: props.node.attrs.label || '',
      url: props.node.attrs.url || '',
      size: props.node.attrs.size || 'md',
    },
    validateOnChange: false,
    validateOnBlur: false,
    validate: (values) => {
      const errors: FormikErrors<CtaFormValues> = {};

      if (!values.label) {
        errors.label = 'Please add a label';
      }

      if (values.label && values.label.length > 50) {
        errors.label = 'Label is too long';
      }

      if (!values.url) {
        errors.url = 'Please add a URL';
      }

      if (values.url && !isValidHttpUrl(values.url)) {
        errors.url = 'Invalid website entered (eg: https://example.com)';
      }

      return errors;
    },
    onSubmit: async (values, { validateForm }) => {
      validateForm();

      props.editor.commands.updateAttributes('cta', {
        ...props.node.attrs,
        label: values.label,
        url: values.url,
        size: values.size,
      });

      if (!hasAttrs) {
        props.editor.commands.createParagraphNear();
      }

      handleCancelCtaDialog();
    },
  });

  return (
    <NodeViewWrapper>
      <div
        data-cta
        data-drag-handle
        // css={{
        //   boxShadow:
        //     props.editor.isEditable && props.selected
        //       ? '0 0 0 1px $colors$green11'
        //       : 'none',
        //   justifyContent: 'center',
        // }}
      >
        {props.editor.isEditable && (
          <Dialog.Root
            open={showCtatDialog}
            onOpenChange={handleCancelCtaDialog}
          >
            <Dialog.Content size="3" className="max-w-[450px]">
              <Dialog.Title asChild>Style your button</Dialog.Title>
              <form className="space-y-4" onSubmit={formik.handleSubmit}>
                <div className="space-y-1">
                  <TextField.Input
                    name="label"
                    value={formik.values.label}
                    onChange={formik.handleChange}
                    maxLength={45}
                    type="text"
                    placeholder="Enter text..."
                  />
                  {formik.errors.label && (
                    <Text as="p" size="2" color="red">
                      {formik.errors.label}
                    </Text>
                  )}
                  <Text as="p" size="1" color="gray">
                    Max: 45 characters.
                  </Text>
                </div>
                <div className="space-y-1">
                  <TextField.Input
                    name="url"
                    value={formik.values.url}
                    onChange={formik.handleChange}
                    maxLength={100}
                    type="text"
                    placeholder="Enter URL..."
                  />
                  {formik.errors.url && (
                    <Text as="p" size="2" color="red">
                      {formik.errors.url}
                    </Text>
                  )}
                </div>
                <Flex direction="column" gap="3">
                  <div className="grid grid-cols-3">
                    <div className="flex items-center justify-center">
                      <Button className="pointer-events-none" size="3">
                        Large
                      </Button>
                    </div>
                    <div className="flex items-center justify-center">
                      <Button className="pointer-events-none" size="2">
                        Medium
                      </Button>
                    </div>
                    <div className="flex items-center justify-center">
                      <Button className="pointer-events-none" size="1">
                        Small
                      </Button>
                    </div>
                  </div>
                  <RadioGroup.Root
                    name="size"
                    onValueChange={(e) => formik.setFieldValue('size', e)}
                    defaultValue={formik.values.size || 'md'}
                    aria-label="Call to action button size"
                  >
                    <div className="grid grid-cols-3">
                      <div className="flex justify-center">
                        <RadioGroup.Item value="lg" id="lg" />
                      </div>
                      <div className="flex justify-center">
                        <RadioGroup.Item value="md" id="md" />
                      </div>
                      <div className="flex justify-center">
                        <RadioGroup.Item value="sm" id="sm" />
                      </div>
                    </div>
                  </RadioGroup.Root>
                </Flex>
                <Text as="p" size="2" color="gray">
                  Tips: You can customize your primary color on the settings
                  page.
                </Text>

                <Flex gap="3" justify="end">
                  <Button
                    onClick={handleCancelCtaDialog}
                    variant="soft"
                    color="gray"
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {hasAttrs ? 'Update Button' : 'Create Button'}
                  </Button>
                </Flex>
              </form>
            </Dialog.Content>
          </Dialog.Root>
        )}

        <p className="not-prose">
          <Button
            // TODO
            // css={{
            //   backgroundColor: settings?.siteColor || '$orange11',
            //   color: settings?.siteColor
            //     ? getContrastingColor(settings?.siteColor)
            //     : 'white',
            //   boxShadow: 'none',

            //   '&:hover': {
            //     backgroundColor: settings?.siteColor || '$orange11',
            //     opacity: '85%',
            //   },

            //   '&:active': {
            //     backgroundColor: settings?.siteColor || '$orange11',
            //     opacity: '80%',
            //   },
            // }}
            size={
              props.node.attrs.size === 'sm'
                ? '1'
                : props.node.attrs.size === 'md'
                  ? '2'
                  : '3'
            }
            asChild
          >
            <a
              className={cn({
                hidden: !hasAttrs,
                'inline-flex': hasAttrs,
              })}
              href={props.node.attrs.url}
              onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
                if (props.editor.isEditable) {
                  e.preventDefault();
                  setShowCtaDialog(true);
                }
              }}
              target="_blank"
              rel="noreferrer"
            >
              {props.node.attrs.label}
            </a>
          </Button>
        </p>
      </div>
    </NodeViewWrapper>
  );
};
