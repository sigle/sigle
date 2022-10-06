import React, { useEffect, useRef, useState } from 'react';
import { NodeViewProps } from '@tiptap/core';
import { NodeViewWrapper } from '@tiptap/react';
import { Box, LoadingSpinner, Button, Flex, FormInput } from '../../../../ui';
import { styled } from '../../../../stitches.config';
import { ErrorMessage } from '../../../../ui/ErrorMessage';
import { FormikErrors, useFormik } from 'formik';
import { loadTwitterWidget, TWITTER_REGEX } from './utils';

const ErrorButton = styled('button', {
  px: '$2',
  color: '$red11',
  backgroundColor: 'transparent',
  fontSize: '14px',
  lineHeight: '18px',
  letterSpacing: '0.2px',
  flexGrow: 1,
  width: '100%',
  py: '$3',

  '@md': {
    flexGrow: 0,
    width: 'auto',
    py: 0,
  },

  '&:hover': {
    backgroundColor: 'transparent',
  },

  '&:active': {
    backgroundColor: 'transparent',
  },
});

const ErrorMessageContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexDirection: 'column',
  backgroundColor: '$red5',
  boxShadow: '0 0 0 1px $colors$red7',
  color: '$red11',
  br: '$2',

  '@md': {
    flexDirection: 'row',
  },
});

const StyledErrorMessage = styled(ErrorMessage, {
  backgroundColor: 'transparent',
});

const StyledFormInput = styled(FormInput, {
  width: '100%',
  '&[type]': {
    boxShadow: 'none',
    backgroundColor: 'transparent',

    '&:hover': {
      boxShadow: 'none',
      backgroundColor: 'transparent',
    },
    '&:focus': {
      boxShadow: 'none',
      backgroundColor: 'transparent',
    },
  },
});

interface TweetValues {
  tweetUrl: string;
}

export const TwitterComponent = (props: NodeViewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isTweetLoading, setIsTweetLoading] = useState(false);

  const tweetId = props.node.attrs['data-twitter-id'];
  const tweetUrl = props.node.attrs.url;

  useEffect(() => {
    loadTwitterWidget().then(() => {
      createTweetOnLoad();
    });
  }, [tweetId]);

  const formik = useFormik<TweetValues>({
    initialValues: {
      tweetUrl: tweetUrl || '',
    },
    validate: (values) => {
      const errors: FormikErrors<TweetValues> = {};

      if (!values.tweetUrl.match(TWITTER_REGEX)) {
        errors.tweetUrl = 'Invalid URL';
      }

      return errors;
    },
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting, validateForm }) => {
      validateForm().then(() => {
        setSubmitting(true);
        const tweetID = values.tweetUrl.split('/')[5].split('?')[0];

        props.editor.commands.updateAttributes('twitter', {
          ...props.node.attrs,
          ['data-twitter-id']: tweetID,
        });
      });
    },
  });

  const createTweetOnSubmit = async (tweetID: string) => {
    // @ts-expect-error Twitter is attached to the window.
    return await window.twttr.widgets.createTweet(
      tweetID,
      containerRef.current
    );
  };

  const createTweetOnLoad = async () => {
    if (tweetId) {
      setIsTweetLoading(true);
      // @ts-expect-error Twitter is attached to the window.
      const tweet = await window.twttr.widgets
        .createTweet(tweetId, containerRef.current)
        .then((value: any) => {
          if (!value) {
            formik.setErrors({ tweetUrl: 'Create tweet error' });
            setIsTweetLoading(false);
            return;
          }
          setIsTweetLoading(false);
        });

      return tweet;
    }
  };

  const retrySubmitTweetID = () => {
    if (formik.values.tweetUrl) {
      const tweetID = formik.values.tweetUrl.split('/')[5].split('?')[0];
      formik.setErrors({ tweetUrl: undefined });
      formik.setSubmitting(true);

      createTweetOnSubmit(tweetID).then((value) => {
        if (!value) {
          formik.setErrors({ tweetUrl: 'Create tweet error' });
          formik.setSubmitting(false);
          return;
        }
        formik.setSubmitting(false);
      });
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    // If user press escape we hide the link input
    if (
      (!formik.values.tweetUrl && event.key === 'Backspace') ||
      event.key === 'Delete'
    ) {
      props.deleteNode();
    }
  };

  return (
    <NodeViewWrapper data-drag-handle data-twitter>
      <>
        {props.editor.isEditable && (
          <>
            {formik.errors.tweetUrl ? (
              <ErrorMessageContainer>
                <StyledErrorMessage>
                  {formik.errors.tweetUrl === 'Invalid URL'
                    ? `Invalid URL`
                    : `An error occurred while pasting the URL or the link is broken`}
                </StyledErrorMessage>
                <Box
                  css={{
                    display: 'box',
                    height: 1,
                    width: '100%',
                    backgroundColor: '$red7',
                    '@md': { display: 'none' },
                  }}
                />
                <Flex
                  css={{ width: '100%', '@md': { width: 'auto', pr: '$5' } }}
                  gap="5"
                >
                  {formik.errors.tweetUrl === 'Invalid URL' ? (
                    <ErrorButton onClick={() => formik.resetForm()}>
                      Reset
                    </ErrorButton>
                  ) : (
                    <ErrorButton onClick={retrySubmitTweetID}>
                      Retry
                    </ErrorButton>
                  )}
                  <Box
                    css={{
                      width: 1,
                      backgroundColor: '$red7',
                      '@md': { my: '-$2' },
                    }}
                  />
                  <ErrorButton
                    onClick={() => {
                      const editor = props.editor;

                      editor.commands.insertContentAt(
                        {
                          from: editor.state.selection.from,
                          to: editor.state.selection.to,
                        },
                        `<a href="${formik.values.tweetUrl}">${formik.values.tweetUrl}</a>`
                      );
                    }}
                  >
                    Paste URL as a link
                  </ErrorButton>
                </Flex>
              </ErrorMessageContainer>
            ) : (
              <>
                {!tweetId && (
                  <Flex
                    onSubmit={formik.handleSubmit}
                    as="form"
                    css={{
                      position: 'relative',
                      boxShadow: '0 0 0 1px $colors$gray7',
                      backgroundColor: '$gray3',
                      br: '$1',
                      pr: '$2',

                      '&:hover': {
                        backgroundColor: '$gray4',
                        boxShadow: '0 0 0 1px $colors$gray8',
                      },

                      '&:focus': {
                        backgroundColor: '$gray4',
                        boxShadow: '0 0 0 1px $colors$gray8',
                      },
                    }}
                  >
                    <StyledFormInput
                      required
                      css={{
                        boxShadow: 'none',
                        br: 0,
                      }}
                      onKeyDown={onKeyDown}
                      onChange={(e) => {
                        formik.handleChange(e);

                        props.editor.commands.updateAttributes('twitter', {
                          ...props.node.attrs,
                          url: e.currentTarget.value,
                        });
                      }}
                      placeholder="Paste tweet URL and press “enter”..."
                      name="tweetUrl"
                      type="text"
                      value={formik.values.tweetUrl}
                    />
                    {formik.isSubmitting ? (
                      <LoadingSpinner />
                    ) : (
                      <Button
                        color="orange"
                        disabled={formik.isSubmitting}
                        size="md"
                        type="submit"
                        css={{
                          visibility: 'hidden',
                          alignSelf: 'center',
                          position: 'absolute',
                          right: '$1',
                        }}
                      >
                        Submit
                      </Button>
                    )}
                  </Flex>
                )}
              </>
            )}
          </>
        )}
      </>
      {isTweetLoading ? (
        <Box css={{ height: 200, display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner />
        </Box>
      ) : null}
      <Box
        ref={containerRef}
        css={{
          margin: '0 auto',
          cursor: 'pointer',
          maxWidth: '550px',

          '& iframe': {
            br: 12,
          },
        }}
      ></Box>
    </NodeViewWrapper>
  );
};
