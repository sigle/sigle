import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Container } from '@sigle/ui';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { EditorHeader } from '@/components/Editor/EditorHeader';
import { EditorSettings } from '@/components/Editor/EditorSettings/EditorSettings';
import { EditorTitle } from '@/components/Editor/EditorTitle';
import { EditorTipTap } from '@/components/Editor/EditorTiptap/EditorTipTap';
import { useRouter } from 'next/router';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';
import { PostIdEditorPagePostQuery } from '@/__generated__/relay/PostIdEditorPagePostQuery.graphql';
import { useEffect } from 'react';
import { useEditorStore } from '@/components/Editor/store';
import { PostIdEditorUpdatePostMutation } from '@/__generated__/relay/PostIdEditorUpdatePostMutation.graphql';

const autoSaveInterval = 3000;

const Editor = () => {
  const router = useRouter();
  const { postId } = router.query;
  const story = useEditorStore((state) => state.story);
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

  const [commit] = useMutation<PostIdEditorUpdatePostMutation>(graphql`
    mutation PostIdEditorUpdatePostMutation($input: UpdatePostInput!) {
      updatePost(input: $input) {
        clientMutationId
        document {
          id
        }
      }
    }
  `);

  useEffect(() => {
    if (data.node) {
      setStory(data.node);
    }
  }, [data.node]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (data.node && story) {
        // Only save if the story has changed
        console.log(story);
        if (
          story.title !== data.node.title ||
          story.content !== data.node.content
        ) {
          commit({
            variables: {
              input: {
                id: data.node.id!,
                content: {
                  title: story.title,
                  content: story.content,
                },
              },
            },
            onCompleted: (data) => {
              console.log(data);
            },
            onError: (error) => {
              // TODO
              console.error(error);
            },
          });
        }
      }
    }, autoSaveInterval);

    return () => clearTimeout(timer);
  }, [data.node, story]);

  // TODO suspense loading state when loading story
  // TODO auto save
  // TODO story not found

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
