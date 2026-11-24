import type { Editor } from "@tiptap/react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
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

export const EditorBubbleMenuLink = ({ editor }: EditorBubbleMenuProps) => {
  const linkValue = useBubbleMenuStore((state) => state.linkValue);
  const setLinkValue = useBubbleMenuStore((state) => state.setLinkValue);
  const setLinkOpen = useBubbleMenuStore((state) => state.setLinkOpen);

  const onSubmitLink = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let safeLinkValue = linkValue.trim();

    if (
      safeLinkValue &&
      !safeLinkValue.startsWith("http") &&
      !safeLinkValue.startsWith("#")
    ) {
      safeLinkValue = `https://${linkValue}`;
    }

    if (safeLinkValue) {
      const pos = editor.state.selection.$head;
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: safeLinkValue })
        // Set the text selection at the end of the link selection
        // that way user can continue to type easily
        .setTextSelection(pos.end())
        // Unset link selection se when the user continues to type it won't be a link
        // We are using `unsetMark` instead of `unsetLink` to avoid the full selection to be unlinked
        .unsetMark("link")
        .run();
    } else {
      // If input text is empty we unset the link
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }

    resetLink();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    // If user press escape we hide the link input
    if (event.key === "Escape") {
      event.preventDefault();
      resetLink();
    }
  };

  const resetLink = () => {
    setLinkOpen(false);
    setLinkValue("");
  };

  return (
    <form className="flex items-center gap-1" onSubmit={onSubmitLink}>
      <input
        aria-label="Link URL"
        className="h-7 w-56 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
        value={linkValue}
        onKeyDown={onKeyDown}
        onChange={(e) => setLinkValue(e.target.value)}
        placeholder="Paste or type a link"
        autoFocus
      />
      <BubbleMenuButton type="submit" aria-label="Apply link" active={false}>
        <IconCheck size={16} />
      </BubbleMenuButton>
      <BubbleMenuButton
        type="button"
        aria-label="Cancel"
        onClick={() => resetLink()}
        active={false}
      >
        <IconX size={16} />
      </BubbleMenuButton>
    </form>
  );
};
