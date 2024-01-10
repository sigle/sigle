import React, { useEffect, useRef, useState } from 'react';
import { NodeViewProps } from '@tiptap/core';
import { NodeViewWrapper } from '@tiptap/react';
import { Text, TextField } from '@radix-ui/themes';
import { IconBrandTwitter } from '@tabler/icons-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  createTweet,
  getTweetIdFromUrl,
  loadTwitterWidget,
  TWITTER_REGEX,
} from './utils';

const twitterEmbedSchema = z.object({
  url: z.string().regex(TWITTER_REGEX, 'Invalid Twitter URL'),
});

type TwitterEmbedFormData = z.infer<typeof twitterEmbedSchema>;

export const TwitterComponent = (props: NodeViewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isTweetLoading, setIsTweetLoading] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    setFocus,
    setError,
    formState: { errors },
  } = useForm<TwitterEmbedFormData>({
    resolver: zodResolver(twitterEmbedSchema),
  });

  const tweetUrl = props.node.attrs.url;

  // Override tiptap focus and focus on input instead
  useEffect(() => {
    if (!tweetUrl) {
      setTimeout(() => {
        setFocus('url');
      }, 5);
    }
  }, []);

  useEffect(() => {
    loadTwitterWidget().then(() => {
      createTweetOnLoad();
    });
  }, []);

  const createTweetOnLoad = async () => {
    if (!tweetUrl) return;

    const tweetId = getTweetIdFromUrl(tweetUrl);
    if (!tweetId) return;

    setIsTweetLoading(true);
    createTweet(tweetId, containerRef).then(() => {
      props.editor.commands.createParagraphNear();
      setIsTweetLoading(false);
    });
  };

  const onSubmit = handleSubmit((formValues) => {
    props.editor.commands.updateAttributes('twitter', {
      ...props.node.attrs,
      url: formValues.url,
    });

    setIsTweetLoading(true);

    const tweetId = getTweetIdFromUrl(formValues.url);

    // @ts-expect-error Twitter is attached to the window.
    if (!tweetId || !window.twttr) {
      return;
    }

    createTweet(tweetId, containerRef).then((value) => {
      if (!value) {
        setError('url', { message: 'Create tweet error' });
        setIsTweetLoading(false);
        return;
      }

      props.editor.commands.createParagraphNear();
      setIsTweetLoading(false);
    });
  });

  // Remove input if empty and user presses backspace or delete key
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (
      (!getValues().url && event.key === 'Backspace') ||
      event.key === 'Delete'
    ) {
      props.deleteNode();
    }
  };

  return (
    <NodeViewWrapper data-twitter>
      {!isTweetLoading && !tweetUrl && (
        <form onSubmit={onSubmit}>
          <TextField.Root size="3">
            <TextField.Slot>
              <IconBrandTwitter height="16" width="16" />
            </TextField.Slot>
            <TextField.Input
              placeholder="Paste tweet URL and press “enter”..."
              {...register('url')}
              onKeyDown={onKeyDown}
            />
          </TextField.Root>
          {errors.url && (
            <Text as="div" size="1" color="red" mt="1">
              {errors.url.message}
            </Text>
          )}
        </form>
      )}

      {isTweetLoading && (
        <div className="flex h-[200px] items-center justify-center">
          <LoadingSpinner />
        </div>
      )}

      {/* Tweet iframe will be rendered in this component */}
      <div
        ref={containerRef}
        className="mx-auto max-w-[550px] cursor-pointer"
      />
    </NodeViewWrapper>
  );
};
