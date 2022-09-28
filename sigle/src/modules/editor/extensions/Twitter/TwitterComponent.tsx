import React, { useEffect, useRef, useState } from 'react';
import { NodeViewProps } from '@tiptap/core';
import { NodeViewWrapper } from '@tiptap/react';
import { Box, LoadingSpinner } from '../../../../ui';

const WIDGET_SCRIPT_URL = 'https://platform.twitter.com/widgets.js';

const loadTwitterWidget = async (): Promise<void> => {
  // @ts-expect-error Twitter is attached to the window.
  if (window.twttr) {
    return;
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = WIDGET_SCRIPT_URL;
    script.async = true;
    document.body?.appendChild(script);
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      reject();
    };
  });
};

export const TwitterComponent = (props: NodeViewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previousTweetIDRef = useRef<string>();
  const [error, setError] = useState(false);
  const [isTweetLoading, setIsTweetLoading] = useState(false);

  const tweetID = String(props.node.attrs['data-twitter-id']);

  useEffect(() => {
    console.log('1', 'mounted');
    console.log('2', tweetID);
  }, [tweetID]);

  useEffect(() => {
    console.log('3', tweetID, previousTweetIDRef.current);

    if (tweetID !== previousTweetIDRef.current) {
      if (previousTweetIDRef.current) {
        previousTweetIDRef.current = tweetID;
      }

      console.log(
        '4',
        tweetID,
        previousTweetIDRef.current,
        containerRef.current
      );
      setIsTweetLoading(true);
      loadTwitterWidget()
        .then(async () => {
          console.log('5', tweetID, previousTweetIDRef.current);
          // @ts-expect-error Twitter is attached to the window.
          const tweet = await window.twttr.widgets.createTweet(
            tweetID,
            containerRef.current
          );
          console.log('6', tweet);

          setIsTweetLoading(false);
        })
        .then(() => {
          console.log('7', tweetID, previousTweetIDRef.current);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [setIsTweetLoading, tweetID]);

  return (
    <NodeViewWrapper>
      {isTweetLoading ? (
        <Box css={{ height: 200, display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner />
        </Box>
      ) : null}
      <Box
        data-drag-handle
        data-twitter
        ref={containerRef}
        css={{
          margin: '0 auto',
          maxWidth: '550px',

          '& iframe': {
            br: 12,
          },
        }}
      ></Box>
    </NodeViewWrapper>
  );
};
