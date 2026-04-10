import {
  NodeViewContent,
  type NodeViewProps,
  NodeViewWrapper,
} from "@tiptap/react";
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
  const handleCHangeLanguage = (value: string) => {
    props.updateAttributes({
      language: value === "auto" ? null : value,
    });
  };

  return (
    <NodeViewWrapper style={{ position: "relative" }}>
      <div className="absolute top-1 right-1">
        <Select
          value={props.node.attrs.language || "auto"}
          onValueChange={handleCHangeLanguage}
        >
          <SelectTrigger className="bg-muted">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
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

      <NodeViewContent as="pre" />
    </NodeViewWrapper>
  );
};
