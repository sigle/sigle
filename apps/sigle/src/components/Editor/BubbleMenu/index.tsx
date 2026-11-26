import type { Editor } from "@tiptap/core";
import {
  IconBold,
  IconCode,
  IconItalic,
  IconLink,
  IconStrikethrough,
} from "@tabler/icons-react";
import { isTextSelection, useEditorState } from "@tiptap/react";
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
    type="button"
    aria-pressed={active}
    {...props}
    className={cn(
      "flex size-7 items-center justify-center rounded-md transition-colors hover:bg-muted hover:text-foreground",
      {
        "text-muted-foreground": !active,
        "bg-muted text-foreground": active,
      },
    )}
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
    isActiveStrike,
    isActiveCode,
    isActiveLink,
  } = useEditorState({
    editor,
    selector: (context) => ({
      isActiveBold: context.editor.isActive("bold"),
      isActiveItalic: context.editor.isActive("italic"),
      isActiveStrike: context.editor.isActive("strike"),
      isActiveCode: context.editor.isActive("code"),
      isActiveLink: context.editor.isActive("link"),
    }),
  });

  // Listen to any key press to detect cmd + k and activate the link edition
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      // We want all our commands to start with the user pressing ctrl or cmd for mac users
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        onSelectLink();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
    // oxlint-disable-next-line exhaustive-deps
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
        // https://github.com/ueberdosis/tiptap/blob/main/packages/extension-bubble-menu/src/bubble-menu-plugin.ts#L195
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

        // Do not show on twitter embed
        if (editor.isActive("embed")) {
          return false;
        }

        return true;
      }}
      editor={editor}
    >
      <div className="flex items-center gap-0.5 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10">
        {!linkOpen ? (
          <>
            <BubbleMenuButton
              aria-label="Bold"
              title="Bold"
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={isActiveBold}
            >
              <IconBold size={16} />
            </BubbleMenuButton>
            <BubbleMenuButton
              aria-label="Italic"
              title="Italic"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={isActiveItalic}
            >
              <IconItalic size={16} />
            </BubbleMenuButton>
            <BubbleMenuButton
              aria-label="Strikethrough"
              title="Strikethrough"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={isActiveStrike}
            >
              <IconStrikethrough size={16} />
            </BubbleMenuButton>
            <BubbleMenuButton
              aria-label="Code"
              title="Code"
              onClick={() => editor.chain().focus().toggleCode().run()}
              active={isActiveCode}
            >
              <IconCode size={16} />
            </BubbleMenuButton>
            <span className="mx-0.5 h-4 w-px bg-foreground/15" />
            <BubbleMenuButton
              aria-label="Link"
              title="Link"
              onClick={() => onSelectLink()}
              active={isActiveLink}
            >
              <IconLink size={16} />
            </BubbleMenuButton>
          </>
        ) : (
          <EditorBubbleMenuLink editor={editor} />
        )}
      </div>
    </TipTapBubbleMenu>
  );
};
