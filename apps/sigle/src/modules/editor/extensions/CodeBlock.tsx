import { NodeViewWrapper, NodeViewProps, NodeViewContent } from '@tiptap/react';
import { darkTheme } from '../../../stitches.config';
import { Box, Button } from '../../../ui';

/**
 * Custom component for the code block extension.
 * Allow a user to select the language for the current code block.
 */
export const CodeBlockComponent = (props: NodeViewProps) => {
  const handleCHangeLanguage: React.ChangeEventHandler<HTMLSelectElement> = (
    event,
  ) => {
    props.updateAttributes({
      language: event.target.value,
    });
  };

  return (
    <NodeViewWrapper style={{ position: 'relative' }}>
      {props.editor.isEditable ? (
        <Box css={{ position: 'absolute', right: '$2', top: '$2' }}>
          {props.editor.isEditable && (
            <Button
              as="select"
              css={{
                color: '$gray5',
                backgroundColor: '$gray10',
                fontSize: '$1',
                outline: 'none',
                border: 'none',
                '&:hover': {
                  color: '$gray1',
                  backgroundColor: '$gray10',
                },

                [`.${darkTheme} &`]: {
                  color: '$gray10',
                  backgroundColor: '$gray5',
                },
              }}
              contentEditable={false}
              onChange={handleCHangeLanguage}
              value={props.node.attrs.language || 'auto'}
            >
              <option value="null">auto</option>
              <option disabled>—</option>
              {props.extension.options.lowlight
                .listLanguages()
                .sort()
                .map((o: string) => (
                  <option value={o} key={o}>
                    {o}
                  </option>
                ))}
            </Button>
          )}
        </Box>
      ) : null}

      <NodeViewContent as={'pre'} />
    </NodeViewWrapper>
  );
};
