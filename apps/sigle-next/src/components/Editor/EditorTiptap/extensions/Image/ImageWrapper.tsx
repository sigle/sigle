import { NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { styled } from '@sigle/stitches.config';
import { LoadingSpinner } from '@sigle/ui';

const StyledNodeViewWrapper = styled(NodeViewWrapper, {
  position: 'relative',
});
const StyledImage = styled('img');

export const Component = ({ ...props }) => {
  const alt = props.node.attrs.alt;

  return (
    <StyledNodeViewWrapper data-drag-handle>
      {props.node.attrs.loading && (
        <LoadingSpinner
          css={{
            position: 'absolute',
            top: '50%',
            left: '50%',
          }}
        />
      )}
      <StyledImage
        className={
          props.editor.isEditable && props.selected
            ? 'ProseMirror-selectednode'
            : ''
        }
        css={{
          opacity: props.node.attrs.loading ? 0.25 : 1,
          '&:hover': {
            outline: props.editor.isEditable ? '1px solid $indigo11' : 'none',
          },
        }}
        src={props.node.attrs.src}
        alt={alt ? alt : ''}
      />
    </StyledNodeViewWrapper>
  );
};
