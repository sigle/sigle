import { Editor } from '@tiptap/react';
import { useCallback, useState } from 'react';
import { styled } from '../../stitches.config';
import { Story } from '../../types';
import { Box, Button, Dialog, DialogContent, DialogTitle } from '../../ui';
import { CommandsListController } from './extensions/SlashCommands';
import { activeNode } from './ActiveNode';
import { slashCommands, SlashCommandsList } from './InlineMenu';

const StyledDialogContent = styled(DialogContent, {
  display: 'flex',
  flexDirection: 'column',
  gap: '$6',
  top: 'auto',
  p: '$5',
  pb: 0,
  width: '100%',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  bottom: 0,

  '@supports (-webkit-touch-callout: none) and (not (translate: none))': {
    '&:first-child': {
      mb: '$6',
    },
  },
});

interface MobileFloatingMenuProps {
  editor: Editor | null;
  story: Story;
  triggerDisabled: boolean;
}

export const MobileFloatingMenu = ({
  editor,
  story,
  triggerDisabled,
}: MobileFloatingMenuProps) => {
  const [showFloatingMenuDialog, setShowFloatingMenuDialog] = useState(false);

  const handleSelect = useCallback(
    ({ command }: any) => {
      command({ editor });
    },
    [editor]
  );

  return (
    <>
      {editor && (
        <>
          <Button
            disabled={triggerDisabled}
            onClick={() => setShowFloatingMenuDialog(true)}
            variant="subtle"
            size="md"
          >
            <Box
              as="span"
              css={{
                p: '$1',
                backgroundColor: '$gray12',
                color: '$gray1',
                mr: '$2',
                br: '$1',

                '& svg': {
                  width: 15,
                  height: 15,
                },
              }}
            >
              {activeNode(editor).icon}
            </Box>
            {activeNode(editor).name}
          </Button>
          <Dialog
            open={showFloatingMenuDialog}
            onOpenChange={() => setShowFloatingMenuDialog(false)}
          >
            <StyledDialogContent closeButton={false}>
              <DialogTitle>Paragraph Style</DialogTitle>
              <Box
                // uses event bubbling to close dialog when selecting an item as would be expected
                onClick={() => setShowFloatingMenuDialog(false)}
              >
                <CommandsListController
                  editor={editor}
                  component={SlashCommandsList}
                  items={slashCommands({ storyId: story.id })}
                  command={handleSelect}
                />
              </Box>
            </StyledDialogContent>
          </Dialog>
        </>
      )}
    </>
  );
};
