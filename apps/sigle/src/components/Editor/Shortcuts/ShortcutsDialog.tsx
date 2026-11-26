import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: () => void;
}

/**
 * A key of a shortcut. `Mod` is Cmd on macOS and Control elsewhere, as in
 * TipTap's keyboard shortcuts.
 */
type Key = "Mod" | "Shift" | "Alt" | (string & {});

interface Shortcut {
  action: string;
  keys: Array<Key>;
}

const sections: Array<{ title: string; items: Array<Shortcut> }> = [
  {
    title: "Essentials",
    items: [
      { action: "Copy", keys: ["Mod", "C"] },
      { action: "Cut", keys: ["Mod", "X"] },
      { action: "Paste", keys: ["Mod", "V"] },
      { action: "Paste without formatting", keys: ["Mod", "Shift", "V"] },
      { action: "Undo", keys: ["Mod", "Z"] },
      { action: "Redo", keys: ["Mod", "Shift", "Z"] },
      { action: "Line break", keys: ["Shift", "Enter"] },
    ],
  },
  {
    title: "Text",
    items: [
      { action: "Bold", keys: ["Mod", "B"] },
      { action: "Italic", keys: ["Mod", "I"] },
      { action: "Strikethrough", keys: ["Mod", "Shift", "S"] },
      { action: "Inline code", keys: ["Mod", "E"] },
      { action: "Link", keys: ["Mod", "K"] },
    ],
  },
  {
    title: "Paragraphs",
    items: [
      { action: "Normal text", keys: ["Mod", "Alt", "0"] },
      { action: "Big heading", keys: ["Mod", "Alt", "2"] },
      { action: "Small heading", keys: ["Mod", "Alt", "3"] },
      { action: "Numbered list", keys: ["Mod", "Shift", "7"] },
      { action: "Bulleted list", keys: ["Mod", "Shift", "8"] },
      { action: "Quote", keys: ["Mod", "Shift", "B"] },
      { action: "Code block", keys: ["Mod", "Alt", "C"] },
    ],
  },
  {
    title: "Selection",
    items: [
      { action: "Select all", keys: ["Mod", "A"] },
      { action: "Extend by a character", keys: ["Shift", "←", "→"] },
      { action: "Extend by a line", keys: ["Shift", "↑", "↓"] },
      { action: "Extend to the start", keys: ["Mod", "Shift", "↑"] },
      { action: "Extend to the end", keys: ["Mod", "Shift", "↓"] },
    ],
  },
];

/** The label of `key` on the user's keyboard. */
const keyLabel = (key: Key, isMac: boolean) => {
  if (key === "Mod") {
    return isMac ? "⌘" : "Ctrl";
  }

  if (isMac && key === "Shift") {
    return "⇧";
  }

  if (isMac && key === "Alt") {
    return "⌥";
  }

  return key;
};

export const ShortcutsDialog = ({
  open,
  onOpenChange,
}: ShortcutsDialogProps) => {
  // Only rendered in the browser, once the dialog opens.
  const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-md">
        <DialogHeader className="p-4 pb-3">
          <DialogTitle className="headline text-2xl leading-tight">
            Keyboard shortcuts
          </DialogTitle>
          <DialogDescription>
            Type <Kbd>/</Kbd> on an empty line to insert blocks.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-4 pb-4">
          {sections.map((section) => (
            <section key={section.title} className="pt-4">
              <h3 className="pb-1 font-mono text-xs text-muted-foreground uppercase">
                {section.title}
              </h3>
              <ul className="border-t border-border">
                {section.items.map((item) => (
                  <li
                    key={item.action}
                    className="flex items-center justify-between gap-4 border-b border-border py-2 text-sm"
                  >
                    <span>{item.action}</span>
                    <KbdGroup>
                      {item.keys.map((key) => (
                        <Kbd key={key}>{keyLabel(key, isMac)}</Kbd>
                      ))}
                    </KbdGroup>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
