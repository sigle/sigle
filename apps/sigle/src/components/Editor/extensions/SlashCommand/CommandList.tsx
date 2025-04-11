import { cn } from "@/lib/cn";
import { Flex, ScrollArea, Text } from "@radix-ui/themes";
import type { Icon } from "@tabler/icons-react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { SlashCommandsCommand } from "./SlashCommands";

export interface CommandListRef {
  onKeyDown: (o: { event: KeyboardEvent }) => boolean;
}

interface CommandListProps {
  items: SlashCommandsCommand[];
  command(item: SlashCommandsCommand): void;
  currentNodeName?: string;
}

export const CommandList = forwardRef<CommandListRef, CommandListProps>(
  ({ items, command }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // When filter is happening reset to index 0
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => setSelectedIndex(0), [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((selectedIndex + items.length - 1) % items.length);
          return true;
        }

        if (event.key === "ArrowDown") {
          setSelectedIndex((selectedIndex + 1) % items.length);
          return true;
        }

        if (event.key === "Enter") {
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

    const basicItems = items.filter((item) => item.section === "basic");
    const embedItems = items.filter((item) => item.section === "embed");

    return (
      <ScrollArea
        className="flex max-h-[332px] flex-col py-2"
        type="always"
        scrollbars="vertical"
        ref={containerRef}
      >
        {basicItems.length > 0 && (
          <div className="px-4 py-2">
            <Text color="gray" size="2">
              Basics
            </Text>
          </div>
        )}
        {basicItems.map(({ title, description, icon: Icon }, index) => (
          <CommandListItem
            key={title}
            index={index}
            selectedIndex={selectedIndex}
            title={title}
            description={description}
            icon={Icon}
            selectItem={selectItem}
          />
        ))}
        {embedItems.length > 0 && (
          <div className="px-4 py-2">
            <Text color="gray" size="2">
              Embeds
            </Text>
          </div>
        )}
        {embedItems.map(({ title, description, icon: Icon }, index) => (
          <CommandListItem
            key={title}
            index={basicItems.length + index}
            selectedIndex={selectedIndex}
            title={title}
            description={description}
            icon={Icon}
            selectItem={selectItem}
          />
        ))}
      </ScrollArea>
    );
  },
);

CommandList.displayName = "CommandList";

const CommandListItem = ({
  index,
  selectedIndex,
  title,
  description,
  icon: Icon,
  selectItem,
}: {
  index: number;
  selectedIndex: number;
  title: string;
  description: string;
  icon: Icon;
  selectItem(index: number): void;
}) => {
  return (
    <div
      data-index={index}
      className={cn(
        "flex w-full cursor-pointer items-center justify-between px-4 py-2 hover:bg-gray-3",
        {
          "bg-gray-3": selectedIndex === index,
        },
      )}
      onClick={() => selectItem(index)}
    >
      <Flex align="center">
        <Icon width={30} height={30} />
        <Flex direction="column" className="ml-2">
          <Text size="2" color="gray" highContrast weight="medium">
            {title}
          </Text>
          <Text size="1" color="gray">
            {description}
          </Text>
        </Flex>
      </Flex>
    </div>
  );
};
