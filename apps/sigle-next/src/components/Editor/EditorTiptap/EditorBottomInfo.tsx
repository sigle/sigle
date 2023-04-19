import { Editor } from '@tiptap/react';
import { useTheme } from 'next-themes';
import { TbKeyboard, TbSun } from 'react-icons/tb';
import { Container, IconButton, Typography } from '@sigle/ui';
import { styled } from '@sigle/stitches.config';

const StyledContainer = styled(Container, {
  position: 'fixed',
  mb: '$10',
  bottom: 0,
  right: 0,
  left: 0,
  zIndex: 0,
  justifyContent: 'end',
  pointerEvents: 'none',
  alignItems: 'center',
  gap: '$3',
  display: 'none',
  '@md': {
    display: 'flex',
  },
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
      {/* <IconButton
        size="sm"
        variant="ghost"
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        css={{
          pointerEvents: 'auto',
        }}
      >
        <TbKeyboard />
      </IconButton> */}
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
