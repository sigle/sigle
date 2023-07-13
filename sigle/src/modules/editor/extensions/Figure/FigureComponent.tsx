import {
  NodeViewContent,
  NodeViewRendererProps,
  NodeViewWrapper,
} from '@tiptap/react';
import { useEffect, useState } from 'react';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { NodeSelection } from '@tiptap/pm/state';
import { LoadingSpinner } from '../../../../ui';
import { styled } from '../../../../stitches.config';

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

const StyledImage = styled('img');

interface FigureNode extends ProseMirrorNode {
  attrs: {
    src: string;
    alt: string;
    uploadId?: string;
  };
}

interface FigureComponentProps extends NodeViewRendererProps {
  node: FigureNode;
  selected: boolean;
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
    <NodeViewWrapper style={{ position: 'relative' }}>
      {props.node.attrs.uploadId && (
        <LoadingSpinner
          css={{
            position: 'absolute',
            top: '50%',
            left: '50%',
          }}
        />
      )}

      <figure data-drag-handle draggable>
        <StyledImage
          contentEditable={false}
          css={{
            opacity: props.node.attrs.uploadId ? 0.25 : 1,
            '&:hover': {
              outline: props.editor.isEditable ? '1px solid $green11' : 'none',
            },
          }}
          src={props.node.attrs.src}
          alt={props.node.attrs.alt}
          className={
            props.editor.isEditable && props.selected
              ? 'ProseMirror-selectednode'
              : ''
          }
          onClick={() => {
            if (typeof props.getPos !== 'function') return;
            const pos = props.getPos();
            props.editor.view.dispatch(
              props.editor.view.state.tr.setSelection(
                NodeSelection.create(props.editor.view.state.doc, pos)
              )
            );
          }}
        />
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
