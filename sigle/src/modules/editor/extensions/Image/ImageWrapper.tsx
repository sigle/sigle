import { NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { styled } from '../../../../stitches.config';

const StyledNodeViewWrapper = styled(NodeViewWrapper, {
  position: 'relative',
});
const StyledImage = styled('img');

export const Component = ({ ...props }) => {
  const alt = props.node.attrs.alt;

  return (
    <StyledNodeViewWrapper data-drag-handle>
      <StyledImage
        className={
          props.editor.isEditable && props.selected
            ? 'ProseMirror-selectednode'
            : ''
        }
        css={{
          '&:hover': {
            outline: props.editor.isEditable ? '1px solid $green11' : 'none',
          },
        }}
        src={props.node.attrs.src}
        alt={alt ? alt : ''}
      />
    </StyledNodeViewWrapper>
  );
};
