import { useEffect, useRef, useState } from 'react';
import { NodeViewProps } from '@tiptap/core';
import { NodeViewWrapper } from '@tiptap/react';

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
  const [isTweetLoading, setIsTweetLoading] = useState(false);

  // TODO show loading component

  const tweetId = props.node.attrs['data-twitter-id'];
  console.log({ tweetId });

  useEffect(() => {
    loadTwitterWidget().then(async () => {
      // @ts-expect-error Twitter is attached to the window.
      await window.twttr.widgets.createTweet(tweetId, containerRef.current);
    });
  }, [tweetId]);

  return (
    <NodeViewWrapper>
      <div
        ref={containerRef}
        style={{ display: 'inline-block', width: '550px' }}
      ></div>
    </NodeViewWrapper>
  );
};
