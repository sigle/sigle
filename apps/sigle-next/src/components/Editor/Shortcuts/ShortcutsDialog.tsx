import { Dialog, Kbd, Table, Tabs, VisuallyHidden } from '@radix-ui/themes';

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: () => void;
}

const essentials = [
  {
    action: 'Copy',
    winCommand: ['Control', 'C'],
    macCommand: ['Cmd', 'C'],
  },
  {
    action: 'Cut',
    winCommand: ['Control', 'X'],
    macCommand: ['Cmd', 'X'],
  },
  {
    action: 'Paste',
    winCommand: ['Control', 'V'],
    macCommand: ['Cmd', 'V'],
  },
  {
    action: 'Paste without formatting',
    winCommand: ['Control', 'Shift', 'V'],
    macCommand: ['Cmd', 'Shift', 'V'],
  },
  {
    action: 'Undo',
    winCommand: ['Control', 'Z'],
    macCommand: ['Cmd', 'Z'],
  },
  {
    action: 'Redo',
    winCommand: ['Control', 'Shift', 'Z'],
    macCommand: ['Cmd', 'Shift', 'Z'],
  },
  {
    action: 'Add a line break',
    winCommand: ['Shift', 'Enter'],
    macCommand: ['Shift', 'Enter'],
  },
];

const textFormatting = [
  {
    action: 'Bold',
    winCommand: ['Control', 'B'],
    macCommand: ['Cmd', 'B'],
  },
  {
    action: 'Italicize',
    winCommand: ['Control', 'I'],
    macCommand: ['Cmd', 'I'],
  },
  {
    action: 'Underline',
    winCommand: ['Control', 'U'],
    macCommand: ['Cmd', 'U'],
  },
  {
    action: 'Strikethrough',
    winCommand: ['Control', 'Shift', 'X'],
    macCommand: ['Cmd', 'Shift', 'X'],
  },
  {
    action: 'Code',
    winCommand: ['Control', 'E'],
    macCommand: ['Cmd', 'E'],
  },
  {
    action: 'Link',
    winCommand: ['Control', 'K'],
    macCommand: ['Cmd', 'K'],
  },
];

const paragraphFormatting = [
  {
    action: 'Apply normal text style',
    winCommand: ['Control', 'Alt', '0'],
    macCommand: ['Cmd', 'Alt', '0'],
  },
  {
    action: 'Apply heading style 2',
    winCommand: ['Control', 'Alt', '2'],
    macCommand: ['Cmd', 'Alt', '2'],
  },
  {
    action: 'Apply heading style 3',
    winCommand: ['Control', 'Alt', '3'],
    macCommand: ['Cmd', 'Alt', '3'],
  },
  {
    action: 'Ordered list',
    winCommand: ['Control', 'Shift', '7'],
    macCommand: ['Cmd', 'Shift', '7'],
  },
  {
    action: 'Bullet list',
    winCommand: ['Control', 'Shift', '8'],
    macCommand: ['Cmd', 'Shift', '8'],
  },
  {
    action: 'Blockquote',
    winCommand: ['Control', 'Shift', 'B'],
    macCommand: ['Cmd', 'Shift', 'B'],
  },
  {
    action: 'Code block',
    winCommand: ['Control', 'Alt', 'C'],
    macCommand: ['Cmd', 'Alt', 'C'],
  },
];

const textSelection = [
  {
    action: 'Select all',
    winCommand: ['Control', 'A'],
    macCommand: ['Cmd', 'A'],
  },
  {
    action: 'Extend selection one character to left',
    winCommand: ['Shift', '←'],
    macCommand: ['Shift', '←'],
  },
  {
    action: 'Extend selection one character to right',
    winCommand: ['Shift', '→'],
    macCommand: ['Shift', '→'],
  },
  {
    action: 'Extend selection one line up',
    winCommand: ['Shift', '↑'],
    macCommand: ['Shift', '↑'],
  },
  {
    action: 'Extend selection one line down',
    winCommand: ['Shift', '↓'],
    macCommand: ['Shift', '↓'],
  },
  {
    action: 'Extend selection to the beginning of the document',
    winCommand: ['Control', 'Shift', '↑'],
    macCommand: ['Cmd', 'Shift', '↑'],
  },
  {
    action: 'Extend selection to the end of the document',
    winCommand: ['Control', 'Shift', '↓'],
    macCommand: ['Cmd', 'Shift', '↓'],
  },
];

const shortcuts = [
  {
    value: 'essentials',
    items: essentials,
  },
  {
    value: 'text-formatting',
    items: textFormatting,
  },
  {
    value: 'p-formatting',
    items: paragraphFormatting,
  },
  {
    value: 'selection',
    items: textSelection,
  },
];

export const ShortcutsDialog = ({
  open,
  onOpenChange,
}: ShortcutsDialogProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <VisuallyHidden>
        <Dialog.Title>Keyboard shortcuts</Dialog.Title>
        <Dialog.Description>
          Explore keyboard shortcuts and hints
        </Dialog.Description>
      </VisuallyHidden>
      <Dialog.Content size="3">
        <Tabs.Root defaultValue="shortcuts">
          <Tabs.List
            className="mb-4"
            aria-label="Find keyboard shortcuts and hints"
            color="gray"
            highContrast
          >
            <Tabs.Trigger value="shortcuts">Keyboard Shortcuts</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="shortcuts">
            <Tabs.Root defaultValue="essentials">
              <Tabs.List
                className="mb-4"
                aria-label="Explore shortcut types"
                color="gray"
                highContrast
              >
                <Tabs.Trigger value="essentials">Essentials</Tabs.Trigger>
                <Tabs.Trigger value="text-formatting">
                  Text Formatting
                </Tabs.Trigger>
                <Tabs.Trigger value="p-formatting">
                  Paragraph Formatting
                </Tabs.Trigger>
                <Tabs.Trigger value="selection">Text Selection</Tabs.Trigger>
              </Tabs.List>
              {shortcuts.map((shortcut) => (
                <Tabs.Content key={shortcut.value} value={shortcut.value}>
                  <Table.Root>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeaderCell>Command</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>
                          Windows/Linux
                        </Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>macOS</Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>

                    <Table.Body>
                      {shortcut.items.map((shortcut) => (
                        <Table.Row key={shortcut.action}>
                          <Table.RowHeaderCell>
                            {shortcut.action}
                          </Table.RowHeaderCell>
                          <Table.Cell>
                            <Kbd size="3">
                              {shortcut.winCommand.join(' + ')}
                            </Kbd>
                          </Table.Cell>
                          <Table.Cell>
                            <Kbd size="3">
                              {shortcut.macCommand.join(' + ')}
                            </Kbd>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Tabs.Content>
              ))}
            </Tabs.Root>
          </Tabs.Content>
        </Tabs.Root>
      </Dialog.Content>
    </Dialog.Root>
  );
};
