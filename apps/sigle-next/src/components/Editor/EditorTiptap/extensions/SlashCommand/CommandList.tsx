import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { darkTheme, globalCss, styled } from '@sigle/stitches.config';
import { Flex, Typography } from '@sigle/ui';
import { SlashCommandsCommand } from './SlashCommands';

const globalStylesSlashCommand = globalCss({
  ".tippy-box[data-theme~='sigle-editor']": {
    backgroundColor: '$gray1',
  },
  ".tippy-box[data-theme~='sigle-editor'] .tippy-content": {
    overflow: 'hidden',
    padding: 0,
    backgroundColor: '$gray1',
    minWidth: '280px',
    boxShadow: '$lg',
    br: '$sm',
  },
});

const CommandsTitle = styled('div', {
  px: '$4',
  py: '$2',
});

const CommandsListSeparator = styled('div', {
  mt: '$3',
  borderBottom: '1px solid $gray6',
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

const CurrentNode = styled('div', {
  backgroundColor: '$green11',
  width: 8,
  height: 8,
  br: '$round',
});

export interface CommandListRef {
  onKeyDown: (o: { event: KeyboardEvent }) => boolean;
}

interface CommandListProps {
  items: SlashCommandsCommand[];
  command(item: SlashCommandsCommand): void;
  currentNodeName?: string;
}

export const CommandList = forwardRef<CommandListRef, CommandListProps>(
  ({ items, command, currentNodeName }, ref) => {
    globalStylesSlashCommand();

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

    return (
      <Flex
        direction="column"
        css={{
          maxHeight: 332,
          overflow: 'auto',
          position: 'relative',
          py: 10,
        }}
        ref={containerRef}
      >
        <CommandsTitle>
          <Typography color="gray9" size="sm">
            Basics
          </Typography>
        </CommandsTitle>
        {items
          .filter((item) => item.section === 'basic')
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
                  <Typography size="sm">{title}</Typography>
                  <Typography size="sm" color="gray9">
                    {description}
                  </Typography>
                </Flex>
              </Flex>
              {currentNodeName === title && <CurrentNode />}
            </CommandsListItem>
          ))}
        <CommandsListSeparator />
      </Flex>
    );
  },
);

CommandList.displayName = 'CommandList';
