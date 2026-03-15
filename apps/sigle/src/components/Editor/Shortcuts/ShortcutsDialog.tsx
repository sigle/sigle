import { Kbd } from "@radix-ui/themes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: () => void;
}

const essentials = [
  {
    action: "Copy",
    winCommand: ["Control", "C"],
    macCommand: ["Cmd", "C"],
  },
  {
    action: "Cut",
    winCommand: ["Control", "X"],
    macCommand: ["Cmd", "X"],
  },
  {
    action: "Paste",
    winCommand: ["Control", "V"],
    macCommand: ["Cmd", "V"],
  },
  {
    action: "Paste without formatting",
    winCommand: ["Control", "Shift", "V"],
    macCommand: ["Cmd", "Shift", "V"],
  },
  {
    action: "Undo",
    winCommand: ["Control", "Z"],
    macCommand: ["Cmd", "Z"],
  },
  {
    action: "Redo",
    winCommand: ["Control", "Shift", "Z"],
    macCommand: ["Cmd", "Shift", "Z"],
  },
  {
    action: "Add a line break",
    winCommand: ["Shift", "Enter"],
    macCommand: ["Shift", "Enter"],
  },
];

const textFormatting = [
  {
    action: "Bold",
    winCommand: ["Control", "B"],
    macCommand: ["Cmd", "B"],
  },
  {
    action: "Italicize",
    winCommand: ["Control", "I"],
    macCommand: ["Cmd", "I"],
  },
  {
    action: "Underline",
    winCommand: ["Control", "U"],
    macCommand: ["Cmd", "U"],
  },
  {
    action: "Strikethrough",
    winCommand: ["Control", "Shift", "X"],
    macCommand: ["Cmd", "Shift", "X"],
  },
  {
    action: "Code",
    winCommand: ["Control", "E"],
    macCommand: ["Cmd", "E"],
  },
  {
    action: "Link",
    winCommand: ["Control", "K"],
    macCommand: ["Cmd", "K"],
  },
];

const paragraphFormatting = [
  {
    action: "Apply normal text style",
    winCommand: ["Control", "Alt", "0"],
    macCommand: ["Cmd", "Alt", "0"],
  },
  {
    action: "Apply heading style 2",
    winCommand: ["Control", "Alt", "2"],
    macCommand: ["Cmd", "Alt", "2"],
  },
  {
    action: "Apply heading style 3",
    winCommand: ["Control", "Alt", "3"],
    macCommand: ["Cmd", "Alt", "3"],
  },
  {
    action: "Ordered list",
    winCommand: ["Control", "Shift", "7"],
    macCommand: ["Cmd", "Shift", "7"],
  },
  {
    action: "Bullet list",
    winCommand: ["Control", "Shift", "8"],
    macCommand: ["Cmd", "Shift", "8"],
  },
  {
    action: "Blockquote",
    winCommand: ["Control", "Shift", "B"],
    macCommand: ["Cmd", "Shift", "B"],
  },
  {
    action: "Code block",
    winCommand: ["Control", "Alt", "C"],
    macCommand: ["Cmd", "Alt", "C"],
  },
];

const textSelection = [
  {
    action: "Select all",
    winCommand: ["Control", "A"],
    macCommand: ["Cmd", "A"],
  },
  {
    action: "Extend selection one character to left",
    winCommand: ["Shift", "←"],
    macCommand: ["Shift", "←"],
  },
  {
    action: "Extend selection one character to right",
    winCommand: ["Shift", "→"],
    macCommand: ["Shift", "→"],
  },
  {
    action: "Extend selection one line up",
    winCommand: ["Shift", "↑"],
    macCommand: ["Shift", "↑"],
  },
  {
    action: "Extend selection one line down",
    winCommand: ["Shift", "↓"],
    macCommand: ["Shift", "↓"],
  },
  {
    action: "Extend selection to the beginning of the document",
    winCommand: ["Control", "Shift", "↑"],
    macCommand: ["Cmd", "Shift", "↑"],
  },
  {
    action: "Extend selection to the end of the document",
    winCommand: ["Control", "Shift", "↓"],
    macCommand: ["Cmd", "Shift", "↓"],
  },
];

const shortcuts = [
  {
    value: "essentials",
    items: essentials,
  },
  {
    value: "text-formatting",
    items: textFormatting,
  },
  {
    value: "p-formatting",
    items: paragraphFormatting,
  },
  {
    value: "selection",
    items: textSelection,
  },
];

export const ShortcutsDialog = ({
  open,
  onOpenChange,
}: ShortcutsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Keyboard shortcuts</DialogTitle>
      <DialogDescription className="sr-only">
        Explore keyboard shortcuts and hints
      </DialogDescription>
      <DialogContent>
        <Tabs defaultValue="shortcuts">
          <TabsList
            variant="line"
            aria-label="Find keyboard shortcuts and hints"
          >
            <TabsTrigger value="shortcuts">Keyboard Shortcuts</TabsTrigger>
          </TabsList>

          <TabsContent value="shortcuts">
            <Tabs defaultValue="essentials">
              <TabsList variant="line" aria-label="Explore shortcut types">
                <TabsTrigger value="essentials">Essentials</TabsTrigger>
                <TabsTrigger value="text-formatting">
                  Text Formatting
                </TabsTrigger>
                <TabsTrigger value="p-formatting">
                  Paragraph Formatting
                </TabsTrigger>
                <TabsTrigger value="selection">Text Selection</TabsTrigger>
              </TabsList>
              {shortcuts.map((shortcut) => (
                <TabsContent key={shortcut.value} value={shortcut.value}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Command</TableHead>
                        <TableHead>Windows/Linux</TableHead>
                        <TableHead>macOS</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {shortcut.items.map((shortcut) => (
                        <TableRow key={shortcut.action}>
                          <TableCell>{shortcut.action}</TableCell>
                          <TableCell>
                            <Kbd size="3">
                              {shortcut.winCommand.join(" + ")}
                            </Kbd>
                          </TableCell>
                          <TableCell>
                            <Kbd size="3">
                              {shortcut.macCommand.join(" + ")}
                            </Kbd>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
