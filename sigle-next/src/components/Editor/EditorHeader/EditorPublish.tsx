import { graphql, useMutation } from 'react-relay';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@sigle/ui';
import { EditorPublishUpdatePostMutation } from '@/__generated__/relay/EditorPublishUpdatePostMutation.graphql';
import { useEditorStore } from '../store';
import { TbRocket } from 'react-icons/tb';

export const EditorPublish = () => {
  const setStory = useEditorStore((state) => state.setStory);
  const story = useEditorStore((state) => state.story);

  const [commit, isLoadingPublishPost] =
    useMutation<EditorPublishUpdatePostMutation>(
      graphql`
        mutation EditorPublishUpdatePostMutation($input: UpdatePostInput!) {
          updatePost(input: $input) {
            clientMutationId
            document {
              id
              status
            }
          }
        }
      `
    );

  const handlePublish = () => {
    if (!story) return;

    commit({
      variables: {
        input: {
          id: story.id,
          content: {
            status: story.status === 'DRAFT' ? 'PUBLISHED' : 'DRAFT',
          },
        },
      },
      onCompleted: (data, errors) => {
        if (errors) {
          // TODO toast error
          Sentry.captureMessage('Error updating story', {
            extra: { errors },
          });
          return;
        }
        if (data.updatePost) {
          setStory({
            status: data.updatePost.document.status ?? undefined,
          });
        }
      },
    });
  };

  console.log(story?.status);

  return (
    <Button
      size="sm"
      variant={{ '@initial': 'light', '@md': 'ghost' }}
      color="indigo"
      rightIcon={story?.status === 'DRAFT' ? <TbRocket /> : null}
      onClick={handlePublish}
      disabled={isLoadingPublishPost}
    >
      {story?.status === 'DRAFT'
        ? isLoadingPublishPost
          ? 'Publishing...'
          : 'Publish'
        : null}
      {story?.status === 'PUBLISHED'
        ? isLoadingPublishPost
          ? 'Unpublishing...'
          : 'Unpublish'
        : null}
    </Button>
  );
};
