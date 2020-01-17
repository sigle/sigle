import React from 'react';
import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';
import { Block } from 'slate';
import { RenderAttributes } from 'slate-react';

const Container = styled.div`
  ${tw`mb-4`};
`;

const Image = styled.img<{ selected: boolean; isUploading?: boolean }>`
  ${tw`opacity-100 block`};
  max-width: 100%;
  max-height: 20em;
  box-shadow: ${props => (props.selected ? '0 0 0 1px #000000;' : 'none')};
  transition: opacity 0.75s;

  ${props =>
    props.isUploading &&
    css`
      ${tw`opacity-25`};
    `}
`;

const Input = styled.input`
  ${tw`w-full text-grey-dark outline-none -mt-4`};
  ::placeholder {
    ${tw`text-grey-dark`};
  }
`;

interface SlateEditorImageProps {
  node: Block;
  attributes: RenderAttributes;
  isFocused: boolean;
}

export const SlateEditorImage = ({
  node,
  attributes,
  isFocused,
}: SlateEditorImageProps) => {
  const src: string = node.data.get('src');
  const id: string = node.data.get('id');
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
      <Input placeholder="Enter a caption for this image (optional)" />
    </Container>
  );
};
