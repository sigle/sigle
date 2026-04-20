import type { Icon } from "@tabler/icons-react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/cn";
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
      $ele?.scrollIntoView({ block: "nearest" });
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
        ref={containerRef}
      >
        {basicItems.length > 0 && (
          <div className="px-4 py-2">
            <p className="text-sm text-muted-foreground">Basics</p>
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
            <p className="text-sm text-muted-foreground">Embeds</p>
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
        `flex w-full cursor-pointer items-center justify-between px-4 py-2 hover:bg-muted`,
        {
          "bg-muted": selectedIndex === index,
        },
      )}
      onClick={() => selectItem(index)}
    >
      <div className="flex items-center">
        <Icon width={30} height={30} />
        <div className="ml-2 flex flex-col">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
};
