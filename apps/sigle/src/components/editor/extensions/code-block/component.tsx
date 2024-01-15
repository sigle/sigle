import { Select } from '@radix-ui/themes';
import { NodeViewWrapper, NodeViewProps, NodeViewContent } from '@tiptap/react';

/**
 * Custom component for the code block extension.
 * Allow a user to select the language for the current code block.
 */
export const CodeBlockComponent = (props: NodeViewProps) => {
  const handleCHangeLanguage = (value: string) => {
    props.updateAttributes({
      language: value === 'auto' ? null : value,
    });
  };

  return (
    <NodeViewWrapper style={{ position: 'relative' }}>
      <div className="absolute right-1 top-1">
        <Select.Root
          value={props.node.attrs.language || 'auto'}
          onValueChange={handleCHangeLanguage}
        >
          <Select.Trigger className="bg-gray-1" />
          <Select.Content>
            <Select.Item value="auto">auto</Select.Item>
            <Select.Separator />
            {props.extension.options.lowlight
              .listLanguages()
              .sort()
              .map((o: string) => (
                <Select.Item value={o} key={o}>
                  {o}
                </Select.Item>
              ))}
          </Select.Content>
        </Select.Root>
      </div>

      <NodeViewContent as={'pre'} />
    </NodeViewWrapper>
  );
};
