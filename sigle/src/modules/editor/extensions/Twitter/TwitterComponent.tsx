import React, { useEffect, useRef, useState } from 'react';
import { NodeViewProps } from '@tiptap/core';
import { NodeViewWrapper } from '@tiptap/react';
import { Box, LoadingSpinner } from '../../../../ui';
import Script from 'next/script';

const WIDGET_SCRIPT_URL = 'https://platform.twitter.com/widgets.js';

export const TwitterComponent = (props: NodeViewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previousTweetIDRef = useRef<string>();
  const [isTweetLoading, setIsTweetLoading] = useState(false);

  const tweetID = String(props.node.attrs['data-twitter-id']);

  const getTweet = async () => {
    // @ts-expect-error Twitter is attached to the window.
    const tweet = await window.twttr.widgets.createTweet(
      tweetID,
      containerRef.current
    );

    return tweet;
  };

  return (
    <NodeViewWrapper>
      <Script src={WIDGET_SCRIPT_URL} onLoad={getTweet} />
      {isTweetLoading && !props.editor.isEditable ? (
        <Box css={{ height: 200, display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner />
        </Box>
      ) : null}
      <Box
        data-drag-handle
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
