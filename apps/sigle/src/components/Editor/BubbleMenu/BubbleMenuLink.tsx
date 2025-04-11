import { cn } from "@/lib/cn";
import { IconX } from "@tabler/icons-react";
import type { Editor } from "@tiptap/react";
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
    <form className="flex" onSubmit={onSubmitLink}>
      <input
        className="w-full bg-transparent pl-2 pr-1 outline-none"
        value={linkValue}
        onKeyDown={onKeyDown}
        onChange={(e) => setLinkValue(e.target.value)}
        placeholder="Enter link ..."
        // biome-ignore lint/a11y/noAutofocus: <explanation>
        autoFocus
      />
      <BubbleMenuButton
        type="button"
        onClick={() => resetLink()}
        active={false}
      >
        <IconX size={18} />
      </BubbleMenuButton>
    </form>
  );
};
