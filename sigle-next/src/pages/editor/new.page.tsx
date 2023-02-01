import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Container, LoadingSpinner } from '@sigle/ui';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { EditorHeader } from '@/components/Editor/EditorHeader';
import { graphql, useMutation } from 'react-relay';
import type { newPostCreatePostMutation } from '@/__generated__/relay/newPostCreatePostMutation.graphql';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const NewPost = () => {
  const router = useRouter();

  const [commit] = useMutation<newPostCreatePostMutation>(graphql`
    mutation newPostCreatePostMutation($input: CreatePostInput!) {
      createPost(input: $input) {
        clientMutationId
        document {
          id
        }
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
      onCompleted: (data) => {
        router.push(`/editor/${data.createPost?.document.id}`);
      },
    });
  }, []);

  return (
    <>
      <EditorHeader />
      <Container css={{ maxWidth: 720, pt: '$20', pb: '$5' }}>
        <LoadingSpinner />
      </Container>
    </>
  );
};

export default function ProtectedNewPost() {
  // TODO auth protect
  const { session } = useCeramic();

  return <TooltipProvider>{session ? <NewPost /> : null}</TooltipProvider>;
}
