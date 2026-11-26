import type { NodeViewProps } from "@tiptap/react";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Custom component for the code block extension.
 * Allow a user to select the language for the current code block.
 */
export const CodeBlockComponent = (props: NodeViewProps) => {
  const handleChangeLanguage = (value: string) => {
    props.updateAttributes({
      language: value === "auto" ? null : value,
    });
  };

  return (
    <NodeViewWrapper className="relative">
      <div className="absolute top-2 right-2">
        <Select
          value={props.node.attrs.language || "auto"}
          onValueChange={handleChangeLanguage}
        >
          <SelectTrigger
            size="sm"
            aria-label="Code language"
            className="h-6 border-none bg-transparent px-1.5 font-mono text-xs text-muted-foreground shadow-none hover:text-foreground dark:bg-transparent"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="font-mono">
            <SelectGroup>
              <SelectItem value="auto">auto</SelectItem>
              <SelectSeparator />
              {props.extension.options.lowlight
                .listLanguages()
                .sort()
                .map((o: string) => (
                  <SelectItem value={o} key={o}>
                    {o}
                  </SelectItem>
                ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* @ts-expect-error as pre is working, tiptap types are incorrect */}
      <NodeViewContent as="pre" />
    </NodeViewWrapper>
  );
};
