import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { Editor } from '@tiptap/react';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { LoadingSpinner } from '../../../../ui';
import { styled } from '../../../../stitches.config';
import { useEffect, useState } from 'react';

const StyledFigcaption = styled('figcaption', {
  position: 'relative',
  'div::before': {
    color: '$gray8',
    height: 0,
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

interface FigureNode extends ProseMirrorNode {
  attrs: {
    loading: boolean;
    src: string;
    alt: string;
  };
}

interface FigureComponentProps {
  selected: boolean;
  editor: Editor;
  node: FigureNode;
}

export const FigureComponent = (props: FigureComponentProps) => {
  const [isFocused, setIsFocused] = useState(false);

  /**
   * Check if the element is focused in order to display the caption placeholder
   */
  useEffect(() => {
    const handleTransaction = () => {
      const docHasFocus =
        props.editor.state.selection.$from.parent === (props.node as any);
      setIsFocused(docHasFocus);
    };

    props.editor.on('transaction', handleTransaction);

    return () => {
      props.editor.off('transaction', handleTransaction);
    };
  }, [props.editor, props.node]);

  return (
    <NodeViewWrapper data-drag-handle>
      {props.node.attrs.loading && (
        <LoadingSpinner
          css={{
            position: 'absolute',
            top: '50%',
            left: '50%',
          }}
        />
      )}
      <figure>
        <img src={props.node.attrs.src} alt={props.node.attrs.alt} />
        <NodeViewContent
          as={StyledFigcaption}
          css={{
            'div::before': {
              content:
                isFocused || props.node.textContent !== ''
                  ? 'none'
                  : '"Enter image caption (optional)"',
            },
          }}
        />
      </figure>
    </NodeViewWrapper>
  );
};
