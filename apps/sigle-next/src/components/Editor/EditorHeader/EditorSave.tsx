import { useMemo } from 'react';
import { graphql, useMutation } from 'react-relay';
import { shallow } from 'zustand/shallow';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@sigle/ui';
import { EditorSaveUpdatePostMutation } from '@/__generated__/relay/EditorSaveUpdatePostMutation.graphql';
import { trpc } from '@/utils/trpc';
import { useToast } from '@/hooks/useToast';
import { useEditorStore } from '../store';

export const EditorSave = () => {
  const utils = trpc.useContext();
  const { toast } = useToast();
  const initialStory = useEditorStore((state) => state.initialStory);
  const setInitialStory = useEditorStore((state) => state.setInitialStory);
  const story = useEditorStore((state) => state.story);

  const [commit, isLoadingUpdatePost] =
    useMutation<EditorSaveUpdatePostMutation>(graphql`
      mutation EditorSaveUpdatePostMutation($input: UpdatePostInput!) {
        updatePost(input: $input) {
          clientMutationId
          document {
            id
            title
            featuredImage
            metaTitle
            metaDescription
            metaImage
            canonicalUrl
          }
        }
      }
    `);

  // State tracking change if the story has changed
  const hasChanged = useMemo(() => {
    if (!story) return false;
    return !shallow(story, initialStory);
  }, [story, initialStory]);

  const handleSave = () => {
    if (!story) return;

    commit({
      variables: {
        input: {
          id: story.id,
          content: {
            title: story.title,
            content: story.content,
            metaTitle: story.metaTitle ?? undefined,
            metaDescription: story.metaDescription ?? undefined,
            canonicalUrl: story.canonicalUrl ?? undefined,
          },
        },
      },
      onCompleted: (data, errors) => {
        if (errors) {
          Sentry.captureMessage('Error updating story', {
            extra: { errors },
          });
          console.error(errors);
          toast({
            description: `Error updating story: ${errors[0].message}`,
            variant: 'error',
          });
          return;
        }
        if (data.updatePost) {
          setInitialStory(story);
          utils.invalidate();
        }
      },
    });
  };

  // TODO auto save for drafts and save button for published posts

  return (
    <Button
      size="sm"
      variant={{ '@initial': 'light', '@md': 'ghost' }}
      onClick={handleSave}
      disabled={!hasChanged || isLoadingUpdatePost}
    >
      {isLoadingUpdatePost ? 'Saving...' : !hasChanged ? 'Saved' : 'Save'}
    </Button>
  );
};
