import { useEffect, useRef, useState } from 'react';
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
  const [isTweetLoading, setIsTweetLoading] = useState(false);

  const tweetID = props.node.attrs['data-twitter-id'];

  useEffect(() => {
    if (tweetID !== previousTweetIDRef.current) {
      setIsTweetLoading(true);
      loadTwitterWidget().then(async () => {
        // @ts-expect-error Twitter is attached to the window.
        await window.twttr.widgets.createTweet(tweetID, containerRef.current);
        setIsTweetLoading(false);
      });
      if (previousTweetIDRef) {
        previousTweetIDRef.current = tweetID;
      }
    }
  }, [setIsTweetLoading, tweetID]);

  return (
    <NodeViewWrapper>
      {isTweetLoading ? (
        <Box css={{ height: 200, display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner />
        </Box>
      ) : null}
      <div
        ref={containerRef}
        style={{ margin: '0 auto', maxWidth: '550px' }}
      ></div>
    </NodeViewWrapper>
  );
};
