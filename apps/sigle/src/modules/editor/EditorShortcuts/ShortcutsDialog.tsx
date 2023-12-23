import { Dialog } from '@radix-ui/themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui';
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

const Kbd = styled('kbd', {
  all: 'unset',
  display: 'grid',
  placeItems: 'center',
  br: '$1',
  backgroundColor: '$gray11',
  color: '$gray1',
  p: '$1',
  fontFamily: '$monaco',
  fontSize: '$2',
});

export const ShortcutsDialog = ({
  open,
  onOpenChange,
}: ShortcutsDialogProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="3">
        <Tabs defaultValue="shortcuts">
          <TabsList aria-label="Find keyboard shortcuts and hints">
            <TabsTrigger value="shortcuts">Keyboard Shortcuts</TabsTrigger>
            <TabsTrigger value="hints">Hints</TabsTrigger>
          </TabsList>

          <TabsContent css={{ height: 600 }} value="shortcuts">
            <Tabs defaultValue="essentials">
              <TabsList css={{ mb: '$4' }} aria-label="Explore shortcut types">
                <TabsTrigger value="essentials">Essentials</TabsTrigger>
                <TabsTrigger value="text-formatting">
                  Text Formatting
                </TabsTrigger>
                <TabsTrigger value="p-formatting">
                  Paragraph Formatting
                </TabsTrigger>
                <TabsTrigger value="selection">Text Selection</TabsTrigger>
              </TabsList>
              <TabsContent value="essentials">
                <Table>
                  {essentials.map((shortcut) => (
                    <Tr key={shortcut.action}>
                      <Th scope="row">{shortcut.action}</Th>
                      <Td>
                        {shortcut.winCommand.map((command) => (
                          <Kbd key={command}>{command}</Kbd>
                        ))}
                      </Td>
                      <Td>
                        {shortcut.macCommand.map((command) => (
                          <Kbd key={command}>{command}</Kbd>
                        ))}
                      </Td>
                    </Tr>
                  ))}
                </Table>
              </TabsContent>
              <TabsContent value="text-formatting">
                <Table>
                  {textFormatting.map((shortcut) => (
                    <Tr key={shortcut.action}>
                      <Th scope="row">{shortcut.action}</Th>
                      <Td>
                        {shortcut.winCommand.map((command) => (
                          <Kbd key={command}>{command}</Kbd>
                        ))}
                      </Td>
                      <Td>
                        {shortcut.macCommand.map((command) => (
                          <Kbd key={command}>{command}</Kbd>
                        ))}
                      </Td>
                    </Tr>
                  ))}
                </Table>
              </TabsContent>
              <TabsContent value="p-formatting">
                <Table>
                  {paragraphFormatting.map((shortcut) => (
                    <Tr key={shortcut.action}>
                      <Th scope="row">{shortcut.action}</Th>
                      <Td>
                        {shortcut.winCommand.map((command) => (
                          <Kbd key={command}>{command}</Kbd>
                        ))}
                      </Td>
                      <Td>
                        {shortcut.macCommand.map((command) => (
                          <Kbd key={command}>{command}</Kbd>
                        ))}
                      </Td>
                    </Tr>
                  ))}
                </Table>
              </TabsContent>
              <TabsContent value="selection">
                <Table>
                  {textSelection.map((shortcut) => (
                    <Tr key={shortcut.action}>
                      <Th scope="row">{shortcut.action}</Th>
                      <Td>
                        {shortcut.winCommand.map((command) => (
                          <Kbd key={command}>{command}</Kbd>
                        ))}
                      </Td>
                      <Td>
                        {shortcut.macCommand.map((command) => (
                          <Kbd key={command}>{command}</Kbd>
                        ))}
                      </Td>
                    </Tr>
                  ))}
                </Table>
              </TabsContent>
            </Tabs>
          </TabsContent>
          <TabsContent value="hints">
            <HintsCarousel />
          </TabsContent>
        </Tabs>
      </Dialog.Content>
    </Dialog.Root>
  );
};
