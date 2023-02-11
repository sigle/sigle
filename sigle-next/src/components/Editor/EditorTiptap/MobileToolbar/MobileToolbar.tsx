import { darkTheme, styled } from '@sigle/stitches.config';
import { Container, Flex, IconButton, Typography } from '@sigle/ui';
import { Editor } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import { slashCommands } from '../extensions/SlashCommand/commands';

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

  // workaround for iOS issue where flex gap is not acknowledged
  '@supports (-webkit-touch-callout: none) and (not (translate: none))': {
    '& button': {
      mr: '$5',
    },
  },
});

interface EditorMobileToolbarProps {
  editor: Editor;
}

export const EditorMobileToolbar = ({ editor }: EditorMobileToolbarProps) => {
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const [position, setPosition] = useState<number>();
  const [softKeyboardIsOpen, setSoftKeyboardIsOpen] = useState(false);
  const scrollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const image = slashCommands.find((item) => item.title === 'Image');

  useEffect(() => {
    window.visualViewport?.addEventListener('resize', () => {
      // detects if virtual keyboard has opened, however an imperfect solution but the best option
      // for iOS browsers currently as it does not yet support Virtual Keyboard API
      setSoftKeyboardIsOpen(!softKeyboardIsOpen);
      handleSetPosition();
    });
    window.visualViewport?.addEventListener('scroll', handleSetPosition);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleSetPosition);
      window.visualViewport?.removeEventListener('scroll', handleSetPosition);
    };
  }, []);

  const handleSetPosition = () => {
    if (pendingUpdate) {
      return;
    }

    if (scrollRef) {
      window.clearTimeout(scrollRef.current as ReturnType<typeof setTimeout>);

      // debounce update to toolbar position on scroll
      scrollRef.current = setTimeout(() => {
        setPendingUpdate(true);

        requestAnimationFrame(() => {
          setPendingUpdate(false);

          const topOffset = window.visualViewport?.offsetTop || 0;

          if (window.visualViewport && topOffset >= 0) {
            setPosition(
              Math.max(
                0,
                window.innerHeight -
                  window.visualViewport.height -
                  window.visualViewport.offsetTop
              )
            );
          }
        });
      }, 150);
    }
  };

  return (
    <ToolbarContainer
      css={{
        transform: `translateY(-${position}px)`,
        transition: 'transform .25s',
      }}
    >
      {/* <MobileFloatingMenu
        editor={editor}
        story={story}
        triggerDisabled={!softKeyboardIsOpen}
      /> */}
      <Flex
        css={{
          // workaround for iOS issue where flex gap is not acknowledged
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
        {/* <ToolbarMenu editor={editor} /> */}
        <Flex
          css={{
            width: 2,
            backgroundColor: '$gray6',
          }}
        />
        {image && (
          <IconButton
            css={{
              p: 0,

              '& svg': {
                [`.${darkTheme} &`]: {
                  filter: 'invert(1)',
                },
              },
            }}
            onClick={() => image.command({ editor: editor })}
          >
            <image.icon width={20} height={20} />
          </IconButton>
        )}
        <Flex
          css={{
            width: 2,
            backgroundColor: '$gray6',
          }}
        />
        <Typography css={{ m: 0, whiteSpace: 'nowrap' }} size="sm">
          {editor.storage.characterCount.words()} words
        </Typography>
      </Flex>
    </ToolbarContainer>
  );
};
