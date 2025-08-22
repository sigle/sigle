import { Container, IconButton, Text } from "@radix-ui/themes";
import { IconKeyboard, IconMoon, IconSun } from "@tabler/icons-react";
import { type Editor, useEditorState } from "@tiptap/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { ShortcutsDialog } from "../Shortcuts/ShortcutsDialog";

interface EditorBottomInfoProps {
  editor: Editor;
}

export const EditorBottomInfo = ({ editor }: EditorBottomInfoProps) => {
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  const { wordsCount } = useEditorState({
    editor,
    selector: (context) => ({
      wordsCount: context.editor.storage.characterCount.words(),
    }),
  });

  return (
    // eslint-disable-next-line better-tailwindcss/no-unregistered-classes
    <div className="not-prose">
      <Container className="fixed inset-x-0 bottom-0 mb-8">
        <div className="pointer-events-none flex items-center justify-end gap-3">
          <Text size="1">{wordsCount} words</Text>
          <IconButton
            variant="ghost"
            size="1"
            color="gray"
            className="pointer-events-auto"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            {resolvedTheme === "light" ? (
              <IconSun size={16} />
            ) : (
              <IconMoon size={16} />
            )}
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
