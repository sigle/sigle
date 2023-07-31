import { TooltipProvider } from '@radix-ui/react-tooltip';
import { useRouter } from 'next/router';
import { graphql, useLazyLoadQuery } from 'react-relay';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { useSession } from 'next-auth/react';
import { Suspense } from 'react';
import { Container, LoadingSpinner, Typography } from '@sigle/ui';
import { EditorHeader } from '@/components/Editor/EditorHeader/EditorHeader';
import { EditorSettings } from '@/components/Editor/EditorSettings/EditorSettings';
import { EditorTitle } from '@/components/Editor/EditorTitle';
import { EditorTipTap } from '@/components/Editor/EditorTiptap/EditorTipTap';
import { PostIdEditorPagePostQuery } from '@/__generated__/relay/PostIdEditorPagePostQuery.graphql';
import { useEditorStore } from '@/components/Editor/store';

const Editor = () => {
  const router = useRouter();
  const { postId } = router.query;
  const story = useEditorStore((state) => state.story);
  const setInitialStory = useEditorStore((state) => state.setInitialStory);

  const data = useLazyLoadQuery<PostIdEditorPagePostQuery>(
    graphql`
      query PostIdEditorPagePostQuery($id: ID!) {
        node(id: $id) {
          ... on Post {
            id
            status
            title
            content
            featuredImage
            metaTitle
            metaDescription
            metaImage
            canonicalUrl
          }
        }
      }
    `,
    { id: postId as string },
  );

  /**
   * This effect is used to update the initial story in the store when the data is loaded
   * It's a deep compare effect to avoid useEffect issues with the story object
   */
  useDeepCompareEffect(() => {
    if (data?.node) {
      // TODO fix types
      setInitialStory(data.node as any);
    }
  }, [data?.node || []]);

  // TODO style story not found
  if (!story) return null;

  return (
    <>
      <EditorHeader />
      <Container css={{ maxWidth: 720, pt: '56px', pb: '$5' }}>
        {story && <EditorTitle />}
        {story && <EditorTipTap />}
      </Container>
      <EditorSettings />
    </>
  );
};

export default function ProtectedEditor() {
  // TODO auth protect
  const { data: session } = useSession();

  const router = useRouter();
  const { postId } = router.query;

  // As it's a static page, the first render will have an undefined postId
  if (!postId) return null;

  return (
    <TooltipProvider>
      {session?.user ? (
        <Suspense
          fallback={
            <>
              <EditorHeader />
              <Container css={{ maxWidth: 720, pt: '56px', pb: '$5' }}>
                <LoadingSpinner />
              </Container>
            </>
          }
        >
          <Editor />
        </Suspense>
      ) : null}
    </TooltipProvider>
  );
}
