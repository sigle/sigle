import { styled } from '@sigle/stitches.config';
import { Button, Flex } from '@sigle/ui';
import { Editor } from '@tiptap/react';
import { useCallback, useState } from 'react';
import { slashCommands } from '../extensions/SlashCommand/commands';

// const StyledDialogTitle = styled(DialogTitle, {
//   ml: '-$1',
// });

// const StyledDialogContent = styled(DialogContent, {
//   display: 'flex',
//   flexDirection: 'column',
//   gap: '$2',
//   top: 'auto',
//   p: '$5',
//   pb: 0,
//   width: '100%',
//   borderTopLeftRadius: 20,
//   borderTopRightRadius: 20,
//   borderBottomLeftRadius: 0,
//   borderBottomRightRadius: 0,
//   bottom: 0,

//   '@supports (-webkit-touch-callout: none) and (not (translate: none))': {
//     '&:first-child': {
//       mb: '$6',
//     },
//   },
// });

const ButtonIconNode = styled('span', {
  p: '$1',
  backgroundColor: '$gray12',
  color: '$gray1',
  mr: '$2',
  br: '$1',
  '& svg': {
    width: 15,
    height: 15,
  },
});

interface MobileToolbarFloatingMenuProps {
  editor: Editor;
  triggerDisabled: boolean;
}

export const MobileToolbarFloatingMenu = ({
  editor,
  triggerDisabled,
}: MobileToolbarFloatingMenuProps) => {
  const [showFloatingMenuDialog, setShowFloatingMenuDialog] = useState(false);

  const handleSelect = useCallback(
    ({ command }: any) => {
      command({ editor });
    },
    [editor]
  );

  const getCurrentNode = () => {
    let nodeTitle: string | undefined = undefined;
    if (editor.isActive('heading', { level: 2 })) {
      nodeTitle = 'Big Heading';
    } else if (editor.isActive('heading', { level: 3 })) {
      nodeTitle = 'Small Heading';
    } else if (editor.isActive('bulletList')) {
      nodeTitle = 'Bulleted list';
    } else if (editor.isActive('orderedList')) {
      nodeTitle = 'Numbered list';
    } else if (editor.isActive('blockquote')) {
      nodeTitle = 'Quote';
    } else if (editor.isActive('codeBlock')) {
      nodeTitle = 'Code';
    } else {
      nodeTitle = 'Plain Text';
    }

    if (nodeTitle) {
      const node = slashCommands.find((item) => item.title === nodeTitle);
      if (!node) return;
      return {
        name: node.title,
        icon: <node.icon />,
      };
    }
  };

  const currentNode = getCurrentNode();

  return (
    <>
      <Button
        disabled={triggerDisabled}
        onClick={() => setShowFloatingMenuDialog(true)}
        variant="light"
        size="md"
      >
        <ButtonIconNode>{currentNode?.icon}</ButtonIconNode>
        {currentNode?.name}
      </Button>
      {/* <Dialog
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
      </Dialog> */}
    </>
  );
};
