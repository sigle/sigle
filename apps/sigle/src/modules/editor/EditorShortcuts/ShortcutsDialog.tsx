import { Dialog, Kbd, Tabs } from '@radix-ui/themes';
import { styled } from '../../../stitches.config';
import { HintsCarousel } from './HintsCarousel';

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

const StyledTable = styled('table', {
  width: '100%',
});

const Tr = styled('tr', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '$5',
  py: '$4',
  mb: '$2',
  boxShadow: '0 1px 0 0 $colors$gray6',

  '&:last-of-type': {
    boxShadow: 'none',
  },
});

const Th = styled('th', {
  fontSize: '$2',
  fontWeight: 400,
  color: '$gray11',
  flex: 1,
  maxWidth: '30%',
  textAlign: 'left',
});

const Td = styled('td', {
  display: 'flex',
  gap: '$2',
  maxWidth: '30%',
  flex: 1,
  textAlign: 'left',
});

interface TableProps {
  children: React.ReactNode;
}

const Table = ({ children }: TableProps) => (
  <StyledTable>
    <thead>
      <Tr css={{ boxShadow: '0 1px 0 0 $colors$gray12' }}>
        <Th scope="col">Command</Th>
        <Th scope="col">Windows/Linux</Th>
        <Th scope="col">macOS</Th>
      </Tr>
    </thead>
    <tbody>{children}</tbody>
  </StyledTable>
);

export const ShortcutsDialog = ({
  open,
  onOpenChange,
}: ShortcutsDialogProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="3">
        <Tabs.Root defaultValue="shortcuts" color="gray">
          <Tabs.List
            aria-label="Find keyboard shortcuts and hints"
            className="mb-4"
          >
            <Tabs.Trigger value="shortcuts" color="gray">
              Keyboard Shortcuts
            </Tabs.Trigger>
            <Tabs.Trigger value="hints" color="gray">
              Hints
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content className="h-[600px]" value="shortcuts">
            <Tabs.Root defaultValue="essentials">
              <Tabs.List className="mb-4" aria-label="Explore shortcut types">
                <Tabs.Trigger value="essentials">Essentials</Tabs.Trigger>
                <Tabs.Trigger value="text-formatting">
                  Text Formatting
                </Tabs.Trigger>
                <Tabs.Trigger value="p-formatting">
                  Paragraph Formatting
                </Tabs.Trigger>
                <Tabs.Trigger value="selection">Text Selection</Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="essentials">
                <Table>
                  {essentials.map((shortcut) => (
                    <Tr key={shortcut.action}>
                      <Th scope="row">{shortcut.action}</Th>
                      <Td>
                        <Kbd>{shortcut.winCommand.join(' + ')}</Kbd>
                      </Td>
                      <Td>
                        <Kbd>{shortcut.macCommand.join(' + ')}</Kbd>
                      </Td>
                    </Tr>
                  ))}
                </Table>
              </Tabs.Content>
              <Tabs.Content value="text-formatting">
                <Table>
                  {textFormatting.map((shortcut) => (
                    <Tr key={shortcut.action}>
                      <Th scope="row">{shortcut.action}</Th>
                      <Td>
                        <Kbd>{shortcut.winCommand.join(' + ')}</Kbd>
                      </Td>
                      <Td>
                        <Kbd>{shortcut.macCommand.join(' + ')}</Kbd>
                      </Td>
                    </Tr>
                  ))}
                </Table>
              </Tabs.Content>
              <Tabs.Content value="p-formatting">
                <Table>
                  {paragraphFormatting.map((shortcut) => (
                    <Tr key={shortcut.action}>
                      <Th scope="row">{shortcut.action}</Th>
                      <Td>
                        <Kbd>{shortcut.winCommand.join(' + ')}</Kbd>
                      </Td>
                      <Td>
                        <Kbd>{shortcut.macCommand.join(' + ')}</Kbd>
                      </Td>
                    </Tr>
                  ))}
                </Table>
              </Tabs.Content>
              <Tabs.Content value="selection">
                <Table>
                  {textSelection.map((shortcut) => (
                    <Tr key={shortcut.action}>
                      <Th scope="row">{shortcut.action}</Th>
                      <Td>
                        <Kbd>{shortcut.winCommand.join(' + ')}</Kbd>
                      </Td>
                      <Td>
                        <Kbd>{shortcut.macCommand.join(' + ')}</Kbd>
                      </Td>
                    </Tr>
                  ))}
                </Table>
              </Tabs.Content>
            </Tabs.Root>
          </Tabs.Content>
          <Tabs.Content value="hints">
            <HintsCarousel />
          </Tabs.Content>
        </Tabs.Root>
      </Dialog.Content>
    </Dialog.Root>
  );
};
