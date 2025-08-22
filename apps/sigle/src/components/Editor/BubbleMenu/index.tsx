import {
  IconBold,
  IconCode,
  IconItalic,
  IconLink,
  IconStrikethrough,
  IconUnderline,
} from "@tabler/icons-react";
import { type Editor, isTextSelection, useEditorState } from "@tiptap/react";
import { BubbleMenu as TipTapBubbleMenu } from "@tiptap/react/menus";
import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { EditorBubbleMenuLink } from "./BubbleMenuLink";
import { useBubbleMenuStore } from "./store";

const BubbleMenuButton = ({
  active,
  ...props
}: { active: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={cn({
      "text-gray-1": !active,
      "text-orange-7 dark:text-orange-9": active,
    })}
  />
);

interface EditorBubbleMenuProps {
  editor: Editor;
}

export const EditorBubbleMenu = ({ editor }: EditorBubbleMenuProps) => {
  const linkOpen = useBubbleMenuStore((state) => state.linkOpen);
  const setLinkValue = useBubbleMenuStore((state) => state.setLinkValue);
  const setLinkOpen = useBubbleMenuStore((state) => state.setLinkOpen);

  const {
    isActiveBold,
    isActiveItalic,
    isActiveUnderline,
    isActiveStrike,
    isActiveCode,
    isActiveLink,
  } = useEditorState({
    editor,
    selector: (context) => ({
      isActiveBold: context.editor.isActive("bold"),
      isActiveItalic: context.editor.isActive("italic"),
      isActiveUnderline: context.editor.isActive("underline"),
      isActiveStrike: context.editor.isActive("strike"),
      isActiveCode: context.editor.isActive("code"),
      isActiveLink: context.editor.isActive("link"),
    }),
  });

  // Listen to any key press to detect cmd + k and activate the link edition
  // biome-ignore lint/correctness/useExhaustiveDependencies: ok
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      // We want all our commands to start with the user pressing ctrl or cmd for mac users
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        onSelectLink();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const onSelectLink = () => {
    // Get href of selected link to pre fill the input
    const existingHref = editor.isActive("link")
      ? editor.getAttributes("link").href
      : "";

    setLinkOpen(true);
    setLinkValue(existingHref);
  };

  const resetLink = () => {
    setLinkOpen(false);
    setLinkValue("");
  };

  return (
    <TipTapBubbleMenu
      className="flex gap-3 px-4 py-3 bg-gray-12 rounded-3 text-gray-1"
      updateDelay={100}
      options={{
        placement: "top",
        offset: 8,
        onHide: () => {
          resetLink();
        },
      }}
      shouldShow={({ editor, state, from, to, view, element }) => {
        // Take the initial implementation of the plugin and extends it
        // https://github.com/ueberdosis/tiptap/blob/main/packages/extension-bubble-menu/src/bubble-menu-plugin.ts#L173
        const { doc, selection } = state;
        const { empty } = selection;

        // Sometime check for `empty` is not enough.
        // Doubleclick an empty paragraph returns a node size of 2.
        // So we check also for an empty text size.
        const isEmptyTextBlock =
          !doc.textBetween(from, to).length && isTextSelection(state.selection);

        // When clicking on a element inside the bubble menu the editor "blur" event
        // is called and the bubble menu item is focussed. In this case we should
        // consider the menu as part of the editor and keep showing the menu
        const isChildOfMenu = element.contains(document.activeElement);

        const hasEditorFocus = view.hasFocus() || isChildOfMenu;

        if (
          !hasEditorFocus ||
          empty ||
          isEmptyTextBlock ||
          !editor.isEditable
        ) {
          return false;
        }
        // End default implementation

        // Do not show menu on images
        if (editor.isActive("image")) {
          return false;
        }

        // Do not show menu on code blocks
        if (editor.isActive("codeBlock")) {
          return false;
        }

        // Do not show menu on dividers
        if (editor.isActive("horizontalRule")) {
          return false;
        }

        /// Do not show on twitter embed
        if (editor.isActive("twitter")) {
          return false;
        }

        return true;
      }}
      editor={editor}
    >
      {!linkOpen ? (
        <>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={isActiveBold}
          >
            <IconBold size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={isActiveItalic}
          >
            <IconItalic size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={isActiveUnderline}
          >
            <IconUnderline size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={isActiveStrike}
          >
            <IconStrikethrough size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={isActiveCode}
          >
            <IconCode size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => onSelectLink()}
            active={isActiveLink}
          >
            <IconLink size={18} />
          </BubbleMenuButton>
        </>
      ) : (
        <EditorBubbleMenuLink editor={editor} />
      )}
    </TipTapBubbleMenu>
  );
};
