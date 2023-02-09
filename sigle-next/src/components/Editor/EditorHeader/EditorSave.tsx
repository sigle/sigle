import { useMemo, useState } from 'react';
import { graphql, useMutation } from 'react-relay';
import { shallow } from 'zustand/shallow';
import { Button } from '@sigle/ui';
import { EditorSaveUpdatePostMutation } from '@/__generated__/relay/EditorSaveUpdatePostMutation.graphql';
import { useRestartSetTimeout } from '@/hooks/useRestartSetTimeout';
import { useEditorStore } from '../store';

export const EditorSave = () => {
  const initialStory = useEditorStore((state) => state.initialStory);
  const setInitialStory = useEditorStore((state) => state.setInitialStory);
  const story = useEditorStore((state) => state.story);
  const restart = useRestartSetTimeout();
  const [saved, setSaved] = useState(false);

  const [commit, isLoadingUpdatePost] =
    useMutation<EditorSaveUpdatePostMutation>(
      graphql`
        mutation EditorSaveUpdatePostMutation($input: UpdatePostInput!) {
          updatePost(input: $input) {
            clientMutationId
            document {
              id
            }
          }
        }
      `
    );

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
          },
        },
      },
      onCompleted: (data) => {
        if (data.updatePost) {
          setInitialStory(story);
          // Show the saved message
          setSaved(true);
          // Hide the saved message after 2 seconds
          restart(setTimeout(() => setSaved(false), 2000));
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
      {isLoadingUpdatePost ? 'Saving...' : saved ? 'Saved' : 'Save'}
    </Button>
  );
};
