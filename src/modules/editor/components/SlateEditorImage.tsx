import React from 'react';
import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';
import { Block } from 'slate';
import { RenderAttributes, Editor } from 'slate-react';

const Container = styled.div`
  ${tw`mb-4 flex flex-col items-center`};
`;

const Image = styled.img<{ selected: boolean; isUploading?: boolean }>`
  ${tw`opacity-100 block`};
  max-width: 100%;
  max-height: 20em;
  box-shadow: ${props => (props.selected ? '0 0 0 1px #000000;' : 'none')};
  transition: opacity 0.75s;
  margin-bottom: 0 !important;

  ${props =>
    props.isUploading &&
    css`
      ${tw`opacity-25`};
    `}
`;

const Input = styled.input`
  ${tw`w-full text-grey-dark outline-none text-center mt-2 text-sm`};
  ::placeholder {
    ${tw`text-grey-dark`};
  }
`;

interface SlateEditorImageProps {
  editor: Editor;
  node: Block;
  attributes: RenderAttributes;
  isFocused: boolean;
}

export const SlateEditorImage = ({
  editor,
  node,
  attributes,
  isFocused,
}: SlateEditorImageProps) => {
  const src: string = node.data.get('src');
  const id: string = node.data.get('id');
  const caption: string | undefined = node.data.get('caption');
  const isUploading: boolean = node.data.get('isUploading');

  return (
    <Container>
      <Image
        {...attributes}
        src={src}
        selected={isFocused}
        isUploading={isUploading}
        id={`image-${id}`}
      />
      <Input
        placeholder="Enter a caption for this image (optional)"
        value={caption || ''}
        onChange={event => {
          editor.setNodeByKey(node.key, {
            type: 'image',
            data: { src, id, caption: event.target.value },
          });
        }}
      />
    </Container>
  );
};
