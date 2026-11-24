import type { Editor } from "@tiptap/react";
import { IconPlus } from "@tabler/icons-react";
import { FloatingMenu as TipTapFloatingMenu } from "@tiptap/react/menus";
import { Button } from "@/components/ui/button";

interface EditorFloatingMenuProps {
  editor: Editor;
}

export const EditorFloatingMenu = ({ editor }: EditorFloatingMenuProps) => {
  const handleButtonClick = () => {
    editor.commands.insertContent("/");
    editor.commands.focus();
  };

  return (
    <TipTapFloatingMenu
      editor={editor}
      pluginKey="inline-add-menu"
      options={{
        placement: "left",
        arrow: false,
      }}
      shouldShow={({ editor, state }) => {
        // Should never show when read-only mode is enabled
        if (!editor.isEditable) {
          return false;
        }

        // Show only on empty blocks
        const empty = state.selection.empty;
        const node = state.selection.$head.node();

        // This might be pretty heavy to do as it's run on every keypress
        // We should look into a different way to do it when we have more time
        const isNotAllowed =
          editor.isActive("bulletList") ||
          editor.isActive("orderedList") ||
          editor.isActive("blockquote");

        return (
          editor.isActive("paragraph") &&
          !isNotAllowed &&
          empty &&
          node.content.size === 0
        );
      }}
    >
      <Button
        size="icon-xs"
        variant="outline"
        aria-label="Insert a block"
        title="Insert a block"
        className="mr-3 rounded-full text-muted-foreground hover:text-foreground"
        onClick={handleButtonClick}
      >
        <IconPlus size={14} />
      </Button>
    </TipTapFloatingMenu>
  );
};
