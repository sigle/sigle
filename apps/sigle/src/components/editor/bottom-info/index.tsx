import { Container, IconButton, Text } from '@radix-ui/themes';
import { IconKeyboard, IconSun } from '@tabler/icons-react';
import { Editor } from '@tiptap/react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { ShortcutsDialog } from '@/modules/editor/EditorShortcuts/ShortcutsDialog';

interface EditorBottomInfoProps {
  editor: Editor;
}

export const EditorBottomInfo = ({ editor }: EditorBottomInfoProps) => {
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="not-prose">
      <Container className="fixed inset-x-0 bottom-0 mb-8">
        <div className="pointer-events-none flex items-center justify-end gap-3">
          <Text size="1">{editor?.storage.characterCount.words()} words</Text>

          <IconButton
            variant="ghost"
            size="1"
            color="gray"
            className="pointer-events-auto"
            onClick={() =>
              setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
            }
          >
            <IconSun size={16} />
          </IconButton>

          <IconButton
            variant="ghost"
            size="1"
            color="gray"
            className="pointer-events-auto"
            onClick={() => setShowShortcutsDialog(true)}
          >
            <IconKeyboard size={16} />
          </IconButton>
        </div>
      </Container>

      <ShortcutsDialog
        open={showShortcutsDialog}
        onOpenChange={() => setShowShortcutsDialog(false)}
      />
    </div>
  );
};
