import { styled } from '@sigle/stitches.config';
import { Container, IconButton, Typography } from '@sigle/ui';
import { Editor } from '@tiptap/react';
import { useTheme } from 'next-themes';
import { TbKeyboard, TbSun } from 'react-icons/tb';

const StyledContainer = styled(Container, {
  position: 'fixed',
  mb: '$10',
  bottom: 0,
  right: 0,
  left: 0,
  zIndex: 0,
  justifyContent: 'end',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
});

interface EditorBottomInfoProps {
  editor: Editor;
}

export const EditorBottomInfo = ({ editor }: EditorBottomInfoProps) => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <StyledContainer>
      <Typography size="sm" color="gray9">
        {editor?.storage.characterCount.words()} words
      </Typography>
      <IconButton
        size="sm"
        variant="ghost"
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        css={{
          pointerEvents: 'auto',
        }}
      >
        <TbKeyboard />
      </IconButton>
      <IconButton
        size="sm"
        variant="ghost"
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        css={{
          pointerEvents: 'auto',
        }}
      >
        <TbSun />
      </IconButton>
    </StyledContainer>
  );
};
