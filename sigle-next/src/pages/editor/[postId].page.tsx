import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Container } from '@sigle/ui';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { EditorHeader } from '@/components/Editor/EditorHeader';
import { EditorSettings } from '@/components/Editor/EditorSettings/EditorSettings';
import { EditorTitle } from '@/components/Editor/EditorTitle';
import { EditorTipTap } from '@/components/Editor/EditorTiptap/EditorTipTap';
import { useRouter } from 'next/router';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { PostIdEditorPagePostQuery } from '@/__generated__/relay/PostIdEditorPagePostQuery.graphql';
import { useEffect } from 'react';
import { useEditorStore } from '@/components/Editor/store';

const Editor = () => {
  const router = useRouter();
  const { postId } = router.query;
  const setStory = useEditorStore((state) => state.setStory);

  const data = useLazyLoadQuery<PostIdEditorPagePostQuery>(
    graphql`
      query PostIdEditorPagePostQuery($id: ID!) {
        node(id: $id) {
          ... on Post {
            id
            title
            content
          }
        }
      }
    `,
    { id: postId as string }
  );

  // TODO suspense loading state when loading story
  // TODO auto save
  // TODO story not found

  useEffect(() => {
    if (data.node) {
      setStory(data.node);
    }
  }, [data.node]);

  return (
    <>
      <EditorHeader />
      <Container css={{ maxWidth: 720, pt: '56px', pb: '$5' }}>
        <EditorTitle />
        <EditorTipTap />
      </Container>
      <EditorSettings />
    </>
  );
};

export default function ProtectedEditor() {
  // TODO auth protect
  const { session } = useCeramic();

  const router = useRouter();
  const { postId } = router.query;

  // As it's a static page, the first render will have an undefined postId
  if (!postId) return null;

  return <TooltipProvider>{session ? <Editor /> : null}</TooltipProvider>;
}
