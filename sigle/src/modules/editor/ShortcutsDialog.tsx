import {
  Dialog,
  DialogContent,
  DialogTrigger,
  IconButton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../ui';
import { styled } from '../../stitches.config';
import { KeyboardIcon } from '@radix-ui/react-icons';
import { HintsCarousel } from './HintsCarousel';

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

export const ShortcutsDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <IconButton aria-label="Open keyboard shortcuts and hints">
          <KeyboardIcon />
        </IconButton>
      </DialogTrigger>
      <DialogContent
        css={{
          backgroundColor: '$gray1',
          display: 'flex',
          flexDirection: 'column',
          gap: '$7',
          maxWidth: '760px',
          px: '$8',
        }}
      >
        <Tabs defaultValue="shortcuts">
          <TabsList aria-label="Find keyboard shortcuts and hints">
            <TabsTrigger value="shortcuts">Keyboard Shortcuts</TabsTrigger>
            <TabsTrigger value="hints">Hints</TabsTrigger>
          </TabsList>

          <TabsContent css={{ height: 650 }} value="shortcuts">
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
                  <Tr>
                    <Th scope="row">Copy</Th>
                    <Td>
                      <Kbd>Control</Kbd>
                      <Kbd>C</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Cmd</Kbd>
                      <Kbd>C</Kbd>
                    </Td>
                  </Tr>
                  <Tr>
                    <Th scope="row">Cut</Th>
                    <Td>
                      <Kbd>Control</Kbd>
                      <Kbd>X</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Cmd</Kbd>
                      <Kbd>X</Kbd>
                    </Td>
                  </Tr>
                  <Tr>
                    <Th scope="row">Paste</Th>
                    <Td>
                      <Kbd>Control</Kbd>
                      <Kbd>V</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Cmd</Kbd>
                      <Kbd>V</Kbd>
                    </Td>
                  </Tr>
                  <Tr>
                    <Th scope="row">Paste without formatting</Th>
                    <Td>
                      <Kbd>Control</Kbd>
                      <Kbd>Shift</Kbd>
                      <Kbd>V</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Cmd</Kbd>
                      <Kbd>Shift</Kbd>
                      <Kbd>V</Kbd>
                    </Td>
                  </Tr>
                  <Tr>
                    <Th scope="row">Undo</Th>
                    <Td>
                      <Kbd>Control</Kbd>
                      <Kbd>Z</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Cmd</Kbd>
                      <Kbd>Z</Kbd>
                    </Td>
                  </Tr>
                  <Tr>
                    <Th scope="row">Redo</Th>
                    <Td>
                      <Kbd>Control</Kbd>
                      <Kbd>Shift</Kbd>
                      <Kbd>Z</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Cmd</Kbd>
                      <Kbd>Shift</Kbd>
                      <Kbd>Z</Kbd>
                    </Td>
                  </Tr>
                  <Tr>
                    <Th scope="row">Add a line break</Th>
                    <Td>
                      <Kbd>Shift</Kbd>
                      <Kbd>Enter</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Cmd</Kbd>
                      <Kbd>Enter</Kbd>
                    </Td>
                  </Tr>
                </Table>
              </TabsContent>
              <TabsContent value="text-formatting">
                <Table>
                  <Tr>
                    <Th scope="row">Bold</Th>
                    <Td>
                      <Kbd>Control</Kbd>
                      <Kbd>B</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Cmd</Kbd>
                      <Kbd>B</Kbd>
                    </Td>
                  </Tr>
                  <Tr>
                    <Th scope="row">Italicize</Th>
                    <Td>
                      <Kbd>Control</Kbd>
                      <Kbd>I</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Cmd</Kbd>
                      <Kbd>I</Kbd>
                    </Td>
                  </Tr>
                  <Tr>
                    <Th scope="row">Underline</Th>
                    <Td>
                      <Kbd>Control</Kbd>
                      <Kbd>U</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Cmd</Kbd>
                      <Kbd>U</Kbd>
                    </Td>
                  </Tr>
                  <Tr>
                    <Th scope="row">Strikethrough</Th>
                    <Td>
                      <Kbd>Control</Kbd>
                      <Kbd>Shift</Kbd>
                      <Kbd>X</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Cmd</Kbd>
                      <Kbd>Shift</Kbd>
                      <Kbd>X</Kbd>
                    </Td>
                  </Tr>
                  <Tr>
                    <Th scope="row">Code</Th>
                    <Td>
                      <Kbd>Control</Kbd>
                      <Kbd>E</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Cmd</Kbd>
                      <Kbd>E</Kbd>
                    </Td>
                  </Tr>
                </Table>
              </TabsContent>
              <TabsContent value="p-formatting">
                <Table>
                  <Tr>
                    <Th scope="row">Apply normal text style</Th>
                    <Td>
                      <Kbd>Control</Kbd>
                      <Kbd>Alt</Kbd>
                      <Kbd>0</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Cmd</Kbd>
                      <Kbd>Alt</Kbd>
                      <Kbd>0</Kbd>
                    </Td>
                  </Tr>
                  <Tr>
                    <Th scope="row">Apply heading style 2</Th>
                    <Td>
                      <Kbd>Control</Kbd>
                      <Kbd>Alt</Kbd>
                      <Kbd>2</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Cmd</Kbd>
                      <Kbd>Alt</Kbd>
                      <Kbd>2</Kbd>
                    </Td>
                  </Tr>
                  <Tr>
                    <Th scope="row">Apply heading style 3</Th>
                    <Td>
                      <Kbd>Control</Kbd>
                      <Kbd>Alt</Kbd>
                      <Kbd>3</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Cmd</Kbd>
                      <Kbd>Alt</Kbd>
                      <Kbd>3</Kbd>
                    </Td>
                  </Tr>
                  <Tr>
                    <Th scope="row">Ordered list</Th>
                    <Td>
                      <Kbd>Control</Kbd>
                      <Kbd>Shift</Kbd>
                      <Kbd>7</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Cmd</Kbd>
                      <Kbd>Shift</Kbd>
                      <Kbd>7</Kbd>
                    </Td>
                  </Tr>
                  <Tr>
                    <Th scope="row">Bullet list</Th>
                    <Td>
                      <Kbd>Control</Kbd>
                      <Kbd>Shift</Kbd>
                      <Kbd>8</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Cmd</Kbd>
                      <Kbd>Shift</Kbd>
                      <Kbd>8</Kbd>
                    </Td>
                  </Tr>
                  <Tr>
                    <Th scope="row">Blockquote</Th>
                    <Td>
                      <Kbd>Control</Kbd>
                      <Kbd>Shift</Kbd>
                      <Kbd>B</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Cmd</Kbd>
                      <Kbd>Shift</Kbd>
                      <Kbd>B</Kbd>
                    </Td>
                  </Tr>
                  <Tr>
                    <Th scope="row">Code block</Th>
                    <Td>
                      <Kbd>Control</Kbd>
                      <Kbd>Alt</Kbd>
                      <Kbd>C</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Cmd</Kbd>
                      <Kbd>Alt</Kbd>
                      <Kbd>C</Kbd>
                    </Td>
                  </Tr>
                </Table>
              </TabsContent>
              <TabsContent value="selection">
                <Table>
                  <Tr>
                    <Th scope="row">Select all</Th>
                    <Td>
                      <Kbd>Control</Kbd>
                      <Kbd>A</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Cmd</Kbd>
                      <Kbd>A</Kbd>
                    </Td>
                  </Tr>
                  <Tr>
                    <Th scope="row">Extend selection one character to left</Th>
                    <Td>
                      <Kbd>Shift</Kbd>
                      <Kbd>←</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Shift</Kbd>
                      <Kbd>←</Kbd>
                    </Td>
                  </Tr>
                  <Tr>
                    <Th scope="row">Extend selection one character to right</Th>
                    <Td>
                      <Kbd>Shift</Kbd>
                      <Kbd>→</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Shift</Kbd>
                      <Kbd>→</Kbd>
                    </Td>
                  </Tr>
                  <Tr>
                    <Th scope="row">Extend selection one line up</Th>
                    <Td>
                      <Kbd>Shift</Kbd>
                      <Kbd>↑</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Shift</Kbd>
                      <Kbd>↑</Kbd>
                    </Td>
                  </Tr>
                  <Tr>
                    <Th scope="row">Extend selection one line down</Th>
                    <Td>
                      <Kbd>Shift</Kbd>
                      <Kbd>↓</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Shift</Kbd>
                      <Kbd>↓</Kbd>
                    </Td>
                  </Tr>
                  <Tr>
                    <Th scope="row">
                      Extend selection to the beginning of the document
                    </Th>
                    <Td>
                      <Kbd>Control</Kbd>
                      <Kbd>Shift</Kbd>
                      <Kbd>↑</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Cmd</Kbd>
                      <Kbd>Shift</Kbd>
                      <Kbd>↑</Kbd>
                    </Td>
                  </Tr>
                  <Tr>
                    <Th scope="row">
                      Extend selection to the end of the document
                    </Th>
                    <Td>
                      <Kbd>Control</Kbd>
                      <Kbd>Shift</Kbd>
                      <Kbd>↓</Kbd>
                    </Td>
                    <Td>
                      <Kbd>Cmd</Kbd>
                      <Kbd>Shift</Kbd>
                      <Kbd>↓</Kbd>
                    </Td>
                  </Tr>
                </Table>
              </TabsContent>
            </Tabs>
          </TabsContent>
          <TabsContent
            value="hints"
            css={{
              position: 'relative',
              px: '$5',
              py: '$4',
            }}
          >
            <HintsCarousel />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
