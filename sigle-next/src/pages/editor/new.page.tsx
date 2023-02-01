import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Container } from '@sigle/ui';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { EditorHeader } from '@/components/Editor/EditorHeader';
import { graphql, useMutation } from 'react-relay';
import type { newPostCreatePostMutation } from '@/__generated__/relay/newPostCreatePostMutation.graphql';
import { useEffect } from 'react';

const NewPost = () => {
  const [commit] = useMutation<newPostCreatePostMutation>(graphql`
    mutation newPostCreatePostMutation($input: CreatePostInput!) {
      createPost(input: $input) {
        clientMutationId
      }
    }
  `);

  useEffect(() => {
    commit({
      variables: {
        input: {
          content: {
            title: '',
            content: '',
          },
        },
      },
      onCompleted: (data) => {},
    });
  }, []);

  return (
    <>
      <EditorHeader />
      <Container css={{ maxWidth: 720, pt: '56px', pb: '$5' }}>
        {/* TODO loading animation */}
      </Container>
    </>
  );
};

export default function ProtectedNewPost() {
  // TODO auth protect
  const { session } = useCeramic();

  return <TooltipProvider>{session ? <NewPost /> : null}</TooltipProvider>;
}
