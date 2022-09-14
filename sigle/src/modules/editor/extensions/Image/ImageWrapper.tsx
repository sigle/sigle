import { NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { styled } from '../../../../stitches.config';
import { LoadingSpinner } from '../../../../ui';

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
        className={props.selected ? 'ProseMirror-selectednode' : ''}
        css={{
          opacity: props.node.attrs.loading ? 0.25 : 1,
          '&:hover': {
            outline: '1px solid $green11',
          },
        }}
        src={props.node.attrs.src}
        alt={alt ? alt : ''}
      />
    </StyledNodeViewWrapper>
  );
};
