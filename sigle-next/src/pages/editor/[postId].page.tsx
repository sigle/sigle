import { TooltipProvider } from '@radix-ui/react-tooltip';
import { styled } from '@sigle/stitches.config';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { EditorHeader } from '@/components/Editor/EditorHeader';
import { EditorSettings } from '@/components/Editor/EditorSettings/EditorSettings';
import { EditorTitle } from '@/components/Editor/EditorTitle';

const Box = styled('div', {});

const Editor = () => {
  // TODO suspense loading state
  // TODO auto save

  return (
    <>
      <EditorHeader />
      <Box css={{ height: 2000 }}>
        <EditorTitle />
      </Box>
      <EditorSettings />
    </>
  );
};

export default function ProtectedEditor() {
  // TODO auth protect
  const { session } = useCeramic();

  return <TooltipProvider>{session ? <Editor /> : null}</TooltipProvider>;
}
