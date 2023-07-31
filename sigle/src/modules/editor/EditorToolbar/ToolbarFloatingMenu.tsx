import { Editor } from '@tiptap/react';
import { useCallback, useState } from 'react';
import { styled } from '../../../stitches.config';
import { Story } from '../../../types';
import { Box, Button, Dialog, DialogContent, DialogTitle } from '../../../ui';
import { CommandList } from '../extensions/SlashCommand/CommandList';
import { activeNode } from '../ActiveNode';
import { slashCommands } from '../extensions/SlashCommand/commands';

const StyledDialogTitle = styled(DialogTitle, {
  ml: '-$1',
});

const StyledDialogContent = styled(DialogContent, {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
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
    [editor],
  );

  const currentNode = editor && activeNode(editor, story.id);
  const isTwitter = currentNode?.name === 'Twitter';

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
                p: isTwitter ? 0 : '$1',
                backgroundColor: '$gray12',
                color: '$gray1',
                mr: '$2',
                br: '$1',

                '& svg': {
                  width: isTwitter ? 18 : 15,
                  height: isTwitter ? 18 : 15,
                },
              }}
            >
              {currentNode?.icon}
            </Box>
            {currentNode?.name}
          </Button>
          <Dialog
            open={showFloatingMenuDialog}
            onOpenChange={() => setShowFloatingMenuDialog(false)}
          >
            <StyledDialogContent closeButton={false}>
              <StyledDialogTitle>Paragraph Style</StyledDialogTitle>
              <Box
                css={{
                  mx: '-$5',
                  '& svg': {
                    width: 20,
                    height: 20,
                  },
                }}
                // uses event bubbling to close dialog when selecting an item as would be expected
                onClick={() => setShowFloatingMenuDialog(false)}
              >
                <CommandList
                  currentNodeName={currentNode?.name}
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
