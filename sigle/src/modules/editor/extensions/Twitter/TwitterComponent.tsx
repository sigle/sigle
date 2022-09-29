import React, { useEffect, useRef, useState } from 'react';
import { NodeViewProps } from '@tiptap/core';
import { NodeViewWrapper } from '@tiptap/react';
import {
  Box,
  LoadingSpinner,
  Button,
  Flex,
  FormInput,
  Typography,
} from '../../../../ui';
import Script from 'next/script';
import { styled } from '../../../../stitches.config';
import { ErrorMessage } from '../../../../ui/ErrorMessage';
import { FormikErrors, useFormik } from 'formik';
import { twitterStatusRegex } from './utils';

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
  const previousTweetIDRef = useRef<string>();
  const [isTweetLoading, setIsTweetLoading] = useState(false);

  const attrTweetId = props.node.attrs['data-twitter-id'];

  useEffect(() => {
    console.log('1', attrTweetId);
  }, []);

  // useEffect(() => {
  //   if (attrTweetId !== previousTweetIDRef.current) {
  //     createTweetOnLoad();

  //     if (previousTweetIDRef.current) {
  //       previousTweetIDRef.current = attrTweetId;
  //     }
  //   }
  // }, [attrTweetId]);

  // useEffect(() => {
  //   console.log('1', attrTweetId);

  //   if (attrTweetId) {
  //     console.log('3', attrTweetId);

  //     getTweet(attrTweetId)
  //       .then(() => {
  //         formik.setSubmitting(false);
  //       })
  //       .catch((errors) => {
  //         formik.setErrors({ tweetUrl: errors });
  //         formik.setSubmitting(false);
  //       });
  //   }

  //   // props.editor.commands.clearContent();
  // }, [attrTweetId]);

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

        createTweetOnSubmit(tweetID)
          .then(() => {
            setSubmitting(false);
          })
          .catch((errors) => {
            formik.setErrors({ tweetUrl: errors });
            setSubmitting(false);
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
    setIsTweetLoading(true);
    // @ts-expect-error Twitter is attached to the window.
    const tweet = await window.twttr.widgets
      .createTweet(String(attrTweetId), containerRef.current)
      .then(() => {
        setIsTweetLoading(false);
      });

    return tweet;
  };

  return (
    <NodeViewWrapper data-drag-handle data-twitter>
      <Script src={WIDGET_SCRIPT_URL} onLoad={createTweetOnLoad} />
      <>
        {props.editor.isEditable && !attrTweetId && (
          <>
            {formik.errors.tweetUrl && !formik.isSubmitting ? (
              <ErrorMessageContainer>
                <StyledErrorMessage>
                  An error occurred while pasting the URL or the link is broken
                </StyledErrorMessage>
                <Flex gap="5">
                  <Typography
                    css={{
                      color: '$red11',
                      m: 0,
                      fontWeight: 600,
                    }}
                    size="subheading"
                  >
                    Retry
                  </Typography>
                  <Typography
                    css={{ color: '$red11', m: 0, fontWeight: 600 }}
                    size="subheading"
                  >
                    Paste URL as a link
                  </Typography>
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
