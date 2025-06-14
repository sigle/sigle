import { IconButton } from "@radix-ui/themes";
import { IconPlus } from "@tabler/icons-react";
import { type Editor, FloatingMenu as TipTapFloatingMenu } from "@tiptap/react";
import "./style.css";

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
      tippyOptions={{
        theme: "sigle-editor-floating-menu",
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
      <IconButton
        color="gray"
        size="2"
        variant="ghost"
        onClick={handleButtonClick}
      >
        <IconPlus width={14} height={14} />
      </IconButton>
    </TipTapFloatingMenu>
  );
};
