import { Editor } from '@tiptap/react';
import { useCallback, useState } from 'react';
import { Dialog } from '@radix-ui/themes';
import { slashCommands } from '@/components/editor/extensions/slash-command/commands';
import { CommandList } from '@/components/editor/extensions/slash-command/command-list';
import { styled } from '../../../stitches.config';
import { Box, Button } from '../../../ui';
import { activeNode } from '../ActiveNode';

const StyledDialogTitle = styled(Dialog.Title, {
  ml: '-$1',
});

const StyledDialogContent = styled(Dialog.Content, {
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
  triggerDisabled: boolean;
}

export const MobileFloatingMenu = ({
  editor,
  triggerDisabled,
}: MobileFloatingMenuProps) => {
  const [showFloatingMenuDialog, setShowFloatingMenuDialog] = useState(false);

  const handleSelect = useCallback(
    ({ command }: any) => {
      command({ editor });
    },
    [editor],
  );

  const currentNode = editor && activeNode(editor);
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
          <Dialog.Root
            open={showFloatingMenuDialog}
            onOpenChange={() => setShowFloatingMenuDialog(false)}
          >
            <StyledDialogContent>
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
                  items={slashCommands}
                  command={handleSelect}
                />
              </Box>
            </StyledDialogContent>
          </Dialog.Root>
        </>
      )}
    </>
  );
};
