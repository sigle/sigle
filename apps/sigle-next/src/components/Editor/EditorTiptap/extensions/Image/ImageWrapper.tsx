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
  let src = props.node.attrs.src;

  // Show image from IPFS using a gateway
  if (src.startsWith('ipfs://')) {
    src = `https://ipfs.filebase.io/ipfs/${src.slice(7)}`;
  } else if (src.startsWith('ar://')) {
    src = `https://arweave.net/${src.slice(5)}`;
  }

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
        src={src}
        alt={alt ? alt : ''}
      />
    </StyledNodeViewWrapper>
  );
};
