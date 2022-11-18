import React, { useEffect, useState } from 'react';
import { NodeViewProps } from '@tiptap/core';
import { NodeViewWrapper } from '@tiptap/react';
import {
  Button,
  Flex,
  FormInput,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  FormHelper,
  FormHelperError,
} from '../../../../ui';
import { FormikErrors, useFormik } from 'formik';
import {
  Label,
  RadioGroupIndicator,
  RadioGroupItem,
  RadioGroupRoot,
} from '../../../../ui/RadioGroup';
import { CheckIcon } from '@radix-ui/react-icons';
import { styled } from '../../../../stitches.config';
import { isValidHttpUrl } from '../../../../utils';
import { useGetUserSettings } from '../../../../hooks/appData';
import { colors, getContrastingColor } from '../../../../utils/colors';

const HiddenLabel = styled(Label, {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
});

interface CtaFormValues {
  label: string;
  url: string;
  size: 'sm' | 'md' | 'lg';
}

export const CtaComponent = (props: NodeViewProps) => {
  const [showCtatDialog, setShowCtaDialog] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const handleCancelCtaDialog = () => setShowCtaDialog(false);
  const { data: settings } = useGetUserSettings();

  useEffect(() => {
    if (!button) {
      setShowCtaDialog(true);
    }
  }, []);

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
        button: true,
      });

      setShowButton(true);
      handleCancelCtaDialog();
    },
  });

  const button = props.node.attrs.button || showButton;
  const size = formik.values.size || props.node.attrs.size;
  const label = formik.values.label || props.node.attrs.label;

  return (
    <NodeViewWrapper>
      <Flex
        data-cta
        data-drag-handle
        css={{
          boxShadow:
            props.editor.isEditable && props.selected
              ? '0 0 0 1px $colors$green11'
              : 'none',
          justifyContent: 'center',
        }}
      >
        {props.editor.isEditable && (
          <Dialog open={showCtatDialog} onOpenChange={handleCancelCtaDialog}>
            <DialogContent
              closeButton={false}
              css={{
                p: '$5',
                maxWidth: 450,
                br: 28,
              }}
            >
              <DialogTitle asChild>
                <Typography css={{ fontWeight: 600, mb: '$4' }} size="h3">
                  Style your button
                </Typography>
              </DialogTitle>
              <Flex
                onSubmit={formik.handleSubmit}
                direction="column"
                gap="4"
                as="form"
              >
                <Flex direction="column" gap="1">
                  <FormInput
                    css={{
                      width: '100%',
                    }}
                    name="label"
                    value={formik.values.label}
                    onChange={formik.handleChange}
                    maxLength={45}
                    type="text"
                    placeholder="Enter text..."
                  />
                  {formik.errors.label && (
                    <FormHelperError css={{ my: '$1' }}>
                      {formik.errors.label}
                    </FormHelperError>
                  )}
                  <FormHelper css={{ color: '$gray9', mt: '$1' }}>
                    Max: 45 characters.
                  </FormHelper>
                </Flex>
                <Flex direction="column" gap="1">
                  <FormInput
                    name="url"
                    value={formik.values.url}
                    onChange={formik.handleChange}
                    maxLength={100}
                    type="text"
                    placeholder="Enter URL..."
                  />
                  {formik.errors.url && (
                    <FormHelperError>{formik.errors.url}</FormHelperError>
                  )}
                </Flex>
                <Flex direction="column" gap="3">
                  <Flex css={{ gap: 80 }} align="end">
                    <Button css={{ pointerEvents: 'none' }} size="lg">
                      Large
                    </Button>
                    <Button css={{ pointerEvents: 'none' }} size="md">
                      Medium
                    </Button>
                    <Button css={{ pointerEvents: 'none' }} size="sm">
                      Small
                    </Button>
                  </Flex>
                  <RadioGroupRoot
                    name="size"
                    onValueChange={(e) => formik.setFieldValue('size', e)}
                    css={{ gap: 80 }}
                    defaultValue={formik.values.size || 'md'}
                    aria-label="Call to action button size"
                  >
                    <Flex
                      css={{
                        width: 78,
                        justifyContent: 'center',
                      }}
                    >
                      <RadioGroupItem value="lg" id="lg">
                        <RadioGroupIndicator>
                          <CheckIcon width={16} height={16} />
                        </RadioGroupIndicator>
                      </RadioGroupItem>
                      <HiddenLabel htmlFor="lg">Large</HiddenLabel>
                    </Flex>
                    <Flex
                      css={{
                        width: 90,
                        justifyContent: 'center',
                      }}
                    >
                      <RadioGroupItem value="md" id="md">
                        <RadioGroupIndicator>
                          <CheckIcon width={16} height={16} />
                        </RadioGroupIndicator>
                      </RadioGroupItem>
                      <HiddenLabel htmlFor="md">Medium</HiddenLabel>
                    </Flex>
                    <Flex
                      css={{
                        width: 60,
                        justifyContent: 'center',
                      }}
                    >
                      <RadioGroupItem value="sm" id="sm">
                        <RadioGroupIndicator>
                          <CheckIcon width={16} height={16} />
                        </RadioGroupIndicator>
                      </RadioGroupItem>
                      <HiddenLabel htmlFor="sm">Small</HiddenLabel>
                    </Flex>
                  </RadioGroupRoot>
                </Flex>
                <Typography css={{ color: '$gray9' }} size="subparagraph">
                  Tips: You can customize your primary color on the settings
                  page.
                </Typography>
                <Flex css={{ alignSelf: 'end' }} gap="5">
                  <Button
                    onClick={handleCancelCtaDialog}
                    variant="ghost"
                    size="lg"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" color="orange" size="lg">
                    {button ? 'Update Button' : 'Create Button'}
                  </Button>
                </Flex>
              </Flex>
            </DialogContent>
          </Dialog>
        )}
        {button && (
          <Button
            css={{
              backgroundColor: settings?.siteColor,
              color: getContrastingColor(settings?.siteColor || colors.pink),

              '&:hover': {
                backgroundColor: settings?.siteColor,
                opacity: '85%',
              },

              '&:active': {
                backgroundColor: settings?.siteColor,
                opacity: '80%',
              },
            }}
            onClick={() => {
              console.log({
                size,
                label,
                button,
              });

              setShowCtaDialog(true);
            }}
            size={size}
          >
            {label}
          </Button>
        )}
      </Flex>
      <Button
        css={{
          display: props.editor.isEditable ? 'none' : 'block',
          backgroundColor: settings?.siteColor,
          color: getContrastingColor(settings?.siteColor || colors.pink),

          '&:hover': {
            backgroundColor: settings?.siteColor,
            opacity: '85%',
          },

          '&:active': {
            backgroundColor: settings?.siteColor,
            opacity: '80%',
          },
        }}
        href={props.node.attrs.url}
        size={props.node.attrs.size}
        as="a"
        target="_blank"
        rel="noreferrer"
      >
        {props.node.attrs.label}
      </Button>
    </NodeViewWrapper>
  );
};
