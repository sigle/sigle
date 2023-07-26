import { graphql, useMutation } from 'react-relay';
import * as Sentry from '@sentry/nextjs';
import { TbRocket } from 'react-icons/tb';
import { Button } from '@sigle/ui';
import { EditorPublishUpdatePostMutation } from '@/__generated__/relay/EditorPublishUpdatePostMutation.graphql';
import { trpc } from '@/utils/trpc';
import { useToast } from '@/hooks/useToast';
import { useEditorStore } from '../store';

export const EditorPublish = () => {
  const utils = trpc.useContext();
  const { toast } = useToast();
  const setStory = useEditorStore((state) => state.setStory);
  const story = useEditorStore((state) => state.story);

  const [commit, isLoadingPublishPost] =
    useMutation<EditorPublishUpdatePostMutation>(graphql`
      mutation EditorPublishUpdatePostMutation($input: UpdatePostInput!) {
        updatePost(input: $input) {
          clientMutationId
          document {
            id
            status
          }
        }
      }
    `);

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
          Sentry.captureMessage('Error publishing story', {
            extra: { errors },
          });
          console.error(errors);
          toast({
            description: `Error publishing story: ${errors[0].message}`,
            variant: 'error',
          });
          return;
        }
        if (data.updatePost) {
          setStory({
            status: data.updatePost.document.status ?? undefined,
          });
          utils.invalidate();
        }
      },
    });
  };

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
