import { Editor } from '@tiptap/react';
import { styled } from '../../../stitches.config';
import { Story } from '../../../types';
import { Box, Container, Flex, IconButton } from '../../../ui';
import { ToolbarBubbleMenu } from './ToolbarBubbleMenu';
import { slashCommands } from '../extensions/SlashCommand/commands';
import { MobileFloatingMenu } from './ToolbarFloatingMenu';

const ToolbarContainer = styled(Container, {
  display: 'flex',
  alignItems: 'center',
  gap: '$5',
  position: 'fixed',
  bottom: 0,
  right: 0,
  left: 0,
  zIndex: 0,
  justifyContent: 'start',
  overflow: 'scroll',
  borderTop: '1px solid $colors$gray6',
  p: '$3',
  backgroundColor: '$gray1',

  '@supports (-webkit-touch-callout: none) and (not (translate: none))': {
    '& button': {
      mr: '$5',
    },
  },
});

interface ToolbarProps {
  editor: Editor | null;
  story: Story;
  position: number | undefined;
  softKeyboardIsOpen: boolean;
}

export const Toolbar = ({
  editor,
  story,
  position,
  softKeyboardIsOpen,
}: ToolbarProps) => {
  return (
    <ToolbarContainer
      css={{
        transform: `translateY(-${position}px)`,
        transition: 'transform .25s',
      }}
    >
      <MobileFloatingMenu
        editor={editor}
        story={story}
        triggerDisabled={!softKeyboardIsOpen}
      />
      {editor && (
        <Flex
          css={{
            '@supports (-webkit-touch-callout: none) and (not (translate: none))':
              {
                '& button': {
                  mr: '$5',
                },
                mr: '$5',
              },
            display: '-webkit-flex',
          }}
          gap="5"
        >
          <ToolbarBubbleMenu editor={editor} />
          <Box
            css={{
              width: 2,
              backgroundColor: '$gray6',
            }}
          />
          {slashCommands({ storyId: story.id })
            .filter((item) => item.title === 'Image')
            .map(({ icon: Icon, command }, idx) => (
              <IconButton
                key={idx}
                css={{
                  p: 0,

                  '& svg': {
                    filter: 'invert(1)',
                  },
                }}
                onClick={() => command({ editor: editor })}
              >
                <Icon width={20} height={20} />
              </IconButton>
            ))}
          <Box
            css={{
              width: 2,
              backgroundColor: '$gray6',
            }}
          />
        </Flex>
      )}
    </ToolbarContainer>
  );
};
