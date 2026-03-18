import type { Editor } from "@tiptap/react";
import { Container } from "@radix-ui/themes";
import { IconKeyboard, IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShortcutsDialog } from "../Shortcuts/ShortcutsDialog";

interface EditorBottomInfoProps {
  editor: Editor;
}

export const EditorBottomInfo = ({ editor }: EditorBottomInfoProps) => {
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  return (
    // oxlint-disable-next-line better-tailwindcss/no-unknown-classes
    <div className="not-prose">
      <Container className="fixed inset-x-0 bottom-0 mb-8">
        <div className="pointer-events-none flex items-center justify-end gap-3">
          <p className="text-xs">
            {editor?.storage.characterCount.words()} words
          </p>
          <Button
            variant="ghost"
            size="icon-sm"
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
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            className="pointer-events-auto"
            onClick={() => setShowShortcutsDialog(true)}
          >
            <IconKeyboard size={16} />
          </Button>
        </div>
      </Container>

      <ShortcutsDialog
        open={showShortcutsDialog}
        onOpenChange={() => setShowShortcutsDialog(false)}
      />
    </div>
  );
};
