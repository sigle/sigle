import React, { useEffect, useRef, useState } from 'react';
import { NodeViewProps } from '@tiptap/core';
import { NodeViewWrapper } from '@tiptap/react';
import { Box, LoadingSpinner, Button, Flex, FormInput } from '../../../../ui';
import Script from 'next/script';
import { styled } from '../../../../stitches.config';
import { ErrorMessage } from '../../../../ui/ErrorMessage';
import { FormikErrors, useFormik } from 'formik';
import { twitterStatusRegex } from './utils';

const ErrorButton = styled('button', {
  px: '$2',
  color: '$red11',
  backgroundColor: 'transparent',
  fontSize: '14px',
  lineHeight: '18px',
  letterSpacing: '0.2px',

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
  backgroundColor: '$red5',
  color: '$red11',
  br: '$2',
  pr: '$5',
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

const WIDGET_SCRIPT_URL = 'https://platform.twitter.com/widgets.js';

interface TweetValues {
  tweetUrl: string;
}

export const TwitterComponent = (props: NodeViewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // const previousTweetIDRef = useRef<string>();
  const [isTweetLoading, setIsTweetLoading] = useState(false);
  const [tweetCreated, setTweetCreated] = useState(false);

  const attrTweetId = props.node.attrs['data-twitter-id'];

  useEffect(() => {
    if (attrTweetId) {
      setTweetCreated(true);
    }
  }, []);

  const formik = useFormik<TweetValues>({
    initialValues: {
      tweetUrl: '',
    },
    validate: (values) => {
      const errors: FormikErrors<TweetValues> = {};

      if (!values.tweetUrl.match(twitterStatusRegex)) {
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

        createTweetOnSubmit(tweetID).then((value) => {
          if (!value) {
            formik.setErrors({ tweetUrl: 'Create tweet error' });
            setSubmitting(false);
            return;
          }
          setSubmitting(false);
          setTweetCreated(true);
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
    if (attrTweetId) {
      setIsTweetLoading(true);
      // @ts-expect-error Twitter is attached to the window.
      const tweet = await window.twttr.widgets
        .createTweet(attrTweetId, containerRef.current)
        .then(() => {
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
        setTweetCreated(true);
      });
    }
  };

  return (
    <NodeViewWrapper data-drag-handle data-twitter>
      <Script src={WIDGET_SCRIPT_URL} onLoad={createTweetOnLoad} />
      <>
        {props.editor.isEditable && !tweetCreated && (
          <>
            {formik.errors.tweetUrl && !formik.isSubmitting ? (
              <ErrorMessageContainer>
                <StyledErrorMessage>
                  {formik.errors.tweetUrl === 'Invalid URL'
                    ? `Invalid URL`
                    : `An error occurred while pasting the URL or the link is broken`}
                </StyledErrorMessage>
                <Flex>
                  {formik.errors.tweetUrl !== 'Invalid URL' && (
                    <ErrorButton onClick={retrySubmitTweetID}>
                      Retry
                    </ErrorButton>
                  )}
                  <ErrorButton onClick={() => formik.resetForm()}>
                    Paste URL as a link
                  </ErrorButton>
                </Flex>
              </ErrorMessageContainer>
            ) : (
              <Flex
                onSubmit={formik.handleSubmit}
                as="form"
                css={{
                  position: 'relative',
                  boxShadow: '0 0 0 1px $colors$gray7',
                  backgroundColor: formik.errors.tweetUrl ? '$red4' : '$gray3',
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
                  onChange={formik.handleChange}
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
