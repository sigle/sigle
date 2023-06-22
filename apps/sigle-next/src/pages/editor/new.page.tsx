import { TooltipProvider } from '@radix-ui/react-tooltip';
import { graphql, useMutation } from 'react-relay';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Container, LoadingSpinner } from '@sigle/ui';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { EditorHeader } from '@/components/Editor/EditorHeader/EditorHeader';
import type { newPostCreatePostMutation } from '@/__generated__/relay/newPostCreatePostMutation.graphql';
import { trpc } from '@/utils/trpc';

const NewPost = () => {
  const router = useRouter();
  const utils = trpc.useContext();
  const isMounted = useRef(false);

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
    // Prevent useEffect from running twice with react strict mode
    if (isMounted.current) return;
    isMounted.current = true;

    commit({
      variables: {
        input: {
          content: {
            title: '',
            content: '',
            status: 'DRAFT',
          },
        },
      },
      onCompleted: (data) => {
        // TODO: handle errors
        if (data.createPost) {
          utils.invalidate().then(() => {
            router.push(`/editor/${data.createPost?.document.id}`);
          });
        }
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
