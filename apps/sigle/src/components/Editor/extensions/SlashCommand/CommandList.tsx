import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ProBadge } from "@/components/Shared/UpgradeDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/cn";
import type { SlashCommandsCommand } from "./SlashCommands";

export interface CommandListRef {
  onKeyDown: (o: { event: KeyboardEvent }) => boolean;
}

interface CommandListProps {
  items: Array<SlashCommandsCommand>;
  command: (item: SlashCommandsCommand) => void;
  currentNodeName?: string;
}

export const CommandList = forwardRef<CommandListRef, CommandListProps>(
  ({ items, command }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const [selectedItems, setSelectedItems] = useState(items);

    // When filter is happening reset to index 0
    if (items !== selectedItems) {
      setSelectedItems(items);
      setSelectedIndex(0);
    }

    const selectItem = (index: number) => {
      const item = items[index];

      if (item) {
        command(item);
      }
    };

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

      const $ele = $div.querySelector(`[data-index="${selectedIndex}"]`);

      $ele?.scrollIntoView({ block: "nearest" });
    }, [selectedIndex]);

    const basicItems = items.filter((item) => item.section === "basic");
    const embedItems = items.filter((item) => item.section === "embed");

    return (
      <ScrollArea
        className="flex max-h-[332px] flex-col p-1"
        ref={containerRef}
      >
        {basicItems.length > 0 && (
          <p className="px-2 pt-2 pb-1 font-mono text-xs text-muted-foreground uppercase">
            Basics
          </p>
        )}
        {basicItems.map(({ title, description, icon: Icon, locked }, index) => (
          <CommandListItem
            key={title}
            index={index}
            selectedIndex={selectedIndex}
            title={title}
            description={description}
            icon={Icon}
            isLocked={locked}
            selectItem={selectItem}
          />
        ))}
        {embedItems.length > 0 && (
          <p className="px-2 pt-2 pb-1 font-mono text-xs text-muted-foreground uppercase">
            Embeds
          </p>
        )}
        {embedItems.map(({ title, description, icon: Icon, locked }, index) => (
          <CommandListItem
            key={title}
            index={basicItems.length + index}
            selectedIndex={selectedIndex}
            title={title}
            description={description}
            icon={Icon}
            isLocked={locked}
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
  isLocked,
  selectItem,
}: {
  index: number;
  selectedIndex: number;
  title: string;
  description: string;
  icon: SlashCommandsCommand["icon"];
  isLocked?: boolean;
  selectItem: (index: number) => void;
}) => {
  return (
    <div
      data-index={index}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted",
        {
          "bg-muted": selectedIndex === index,
        },
      )}
      onClick={() => selectItem(index)}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
        <Icon size={16} />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2 text-sm text-foreground">
          {title}
          {isLocked ? <ProBadge /> : null}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {description}
        </span>
      </span>
    </div>
  );
};
