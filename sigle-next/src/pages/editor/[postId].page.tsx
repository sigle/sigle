import { TooltipProvider } from '@radix-ui/react-tooltip';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { EditorHeader } from '@/components/Editor/EditorHeader';
import { EditorSettings } from '@/components/Editor/EditorSettings/EditorSettings';
import { EditorTitle } from '@/components/Editor/EditorTitle';
import { Container } from '@sigle/ui';
import { EditorTipTap } from '@/components/Editor/EditorTiptap/EditorTipTap';

const Editor = () => {
  // TODO suspense loading state when loading story
  // TODO auto save

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

  return <TooltipProvider>{session ? <Editor /> : null}</TooltipProvider>;
}
