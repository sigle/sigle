import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { CtaIcon } from '../../../../icons/CtaIcon';
import { darkTheme, styled } from '../../../../stitches.config';
import { Box, Flex, Typography } from '../../../../ui';
import { SlashCommandsCommand } from './SlashCommands';

// TODO stop using Text

const CommandsListSeparator = styled('div', {
  mt: '$3',
  borderBottom: '1px solid $colors$gray6',
});

const CommandsListLabel = styled('p', {
  py: '$2',
  px: '$4',
  color: '$gray9',
  fontSize: '13px',
  lineHeight: '18px',
  letterSpacing: '0.2px',
});

const CommandsListItem = styled('li', {
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  py: '$2',
  px: '$4',
  '&.is-selected,&:hover': {
    backgroundColor: '$gray3',
  },
});

export interface CommandListRef {
  onKeyDown: (o: { event: KeyboardEvent }) => boolean;
}

interface CommandListProps {
  // TODO change SlashCommandsCommand name
  items: SlashCommandsCommand[];
  command(item: SlashCommandsCommand): void;
  currentNodeName?: string;
}

export const CommandList = forwardRef<CommandListRef, CommandListProps>(
  ({ items, command, currentNodeName }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // When filter is happening reset to index 0
    useEffect(() => setSelectedIndex(0), [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((selectedIndex + items.length - 1) % items.length);
          return true;
        }

        if (event.key === 'ArrowDown') {
          setSelectedIndex((selectedIndex + 1) % items.length);
          return true;
        }

        if (event.key === 'Enter') {
          selectItem(selectedIndex);
          return true;
        }

        return false;
      },
    }));

    useEffect(() => {
      const $div = containerRef.current;
      if (!$div) {
        return;
      }
      const $ele = $div.querySelector(
        `[data-index="${selectedIndex}"]`,
      ) as HTMLButtonElement;
      if (!$ele) {
        return;
      }
      const top = $div.scrollTop;

      const min = $ele.offsetTop;
      if (min < top) {
        $div.scrollTop = min;
        return;
      }
      const max = min + $ele.clientHeight;
      const h = $div.clientHeight;
      if (max > top + h) {
        $div.scrollTop = max - h;
        return;
      }
    }, [selectedIndex]);

    const selectItem = (index: number) => {
      const item = items[index];

      if (item) {
        command(item);
      }
    };

    const twitterItemIndex = items.findIndex(
      (item) => item.title === 'Twitter',
    );
    const twitterItem = items[twitterItemIndex];

    const callToActionItemIndex = items.findIndex(
      (item) => item.title === 'Call To Action',
    );
    const callToActionItem = items[callToActionItemIndex];

    return (
      <Flex
        direction="column"
        css={{ maxHeight: 332, overflow: 'auto', position: 'relative', py: 10 }}
        ref={containerRef}
      >
        <CommandsListLabel>Basics</CommandsListLabel>
        {items
          .filter(
            (item) =>
              item.title !== 'Twitter' && item.title !== 'Call To Action',
          )
          .map(({ title, description, icon: Icon }, index) => (
            <CommandsListItem
              key={index}
              data-index={index}
              className={selectedIndex === index ? 'is-selected' : ''}
              onClick={() => selectItem(index)}
            >
              <Flex
                css={{
                  [`.${darkTheme} &`]: {
                    '& svg': {
                      filter: 'invert(1)',
                    },
                  },
                }}
                align="center"
              >
                <Icon width={28} height={28} />
                <Flex direction="column" css={{ ml: '$2' }}>
                  <Typography size="subparagraph">{title}</Typography>
                  <Typography size="subparagraph" css={{ color: '$gray9' }}>
                    {description}
                  </Typography>
                </Flex>
              </Flex>
              {currentNodeName === title && (
                <Box
                  css={{
                    backgroundColor: '$green11',
                    width: 8,
                    height: 8,
                    br: '$round',
                  }}
                />
              )}
            </CommandsListItem>
          ))}
        <CommandsListSeparator />
        <CommandsListLabel>Embeds</CommandsListLabel>
        {callToActionItem && (
          <CommandsListItem
            data-index={callToActionItemIndex}
            className={
              selectedIndex === callToActionItemIndex ? 'is-selected' : ''
            }
            onClick={() => selectItem(callToActionItemIndex)}
          >
            <Flex align="center">
              <CtaIcon width={28} height={28} />
              <Flex direction="column" css={{ ml: '$2' }}>
                <Typography size="subparagraph">
                  {callToActionItem.title}
                </Typography>
                <Typography size="subparagraph" css={{ color: '$gray9' }}>
                  {callToActionItem.description}
                </Typography>
              </Flex>
            </Flex>
            {currentNodeName === callToActionItem.title && (
              <Box
                css={{
                  backgroundColor: '$green11',
                  width: 8,
                  height: 8,
                  br: '$round',
                }}
              />
            )}
          </CommandsListItem>
        )}
        {twitterItem && (
          <CommandsListItem
            data-index={twitterItemIndex}
            className={selectedIndex === twitterItemIndex ? 'is-selected' : ''}
            onClick={() => selectItem(twitterItemIndex)}
          >
            <Flex align="center">
              <twitterItem.icon width={28} height={28} />
              <Flex direction="column" css={{ ml: '$2' }}>
                <Typography size="subparagraph">{twitterItem.title}</Typography>
                <Typography size="subparagraph" css={{ color: '$gray9' }}>
                  {twitterItem.description}
                </Typography>
              </Flex>
            </Flex>
            {currentNodeName === twitterItem.title && (
              <Box
                css={{
                  backgroundColor: '$green11',
                  width: 8,
                  height: 8,
                  br: '$round',
                }}
              />
            )}
          </CommandsListItem>
        )}
      </Flex>
    );
  },
);
