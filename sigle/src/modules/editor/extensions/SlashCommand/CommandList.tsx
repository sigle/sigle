import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { styled } from '../../../../stitches.config';
import { Flex, Text } from '../../../../ui';
import { SlashCommandsCommand } from '../SlashCommands';

// TODO stop using Text

const CommandsListItem = styled('li', {
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  py: '$1',
  px: '$3',
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
}

export const CommandList = forwardRef<CommandListRef, CommandListProps>(
  ({ items, command }, ref) => {
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
        `[data-index="${selectedIndex}"]`
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
        gap="2"
        direction="column"
        css={{ maxHeight: 360, overflow: 'auto' }}
        ref={containerRef}
      >
        {items.map(({ title, description, icon: Icon }, index) => (
          <CommandsListItem
            key={index}
            data-index={index}
            className={selectedIndex === index ? 'is-selected' : ''}
            onClick={() => selectItem(index)}
          >
            <Icon width={35} height={35} />
            <Flex direction="column" css={{ ml: '$2' }}>
              <Text>{title}</Text>
              <Text css={{ color: '$gray9', mt: '-8px' }}>{description}</Text>
            </Flex>
          </CommandsListItem>
        ))}
      </Flex>
    );
  }
);
