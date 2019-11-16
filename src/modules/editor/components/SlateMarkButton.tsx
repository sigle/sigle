import React from 'react';
import { Editor } from 'slate-react';
import { IconType } from 'react-icons';
import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';
import { hasMark } from './utils';

interface MarkButtonProps {
  editor: Editor;
  type: string;
  icon: IconType;
}

const HoverMenuButton = styled.div<{ active: boolean }>`
  ${tw`text-white cursor-pointer`};
  padding-left: 0.3rem;
  padding-right: 0.3rem;
  ${props =>
    props.active &&
    css`
      ${tw`text-pink`};
    `}
`;

const onClickMark = (editor: Editor, type: string) => {
  editor.toggleMark(type);
};

export const SlateMarkButton = ({
  editor,
  type,
  icon: Icon,
}: MarkButtonProps) => {
  const { value } = editor;
  const isActive = hasMark(value, type);

  return (
    <HoverMenuButton
      active={isActive}
      onMouseDown={event => {
        event.preventDefault();
        onClickMark(editor, type);
      }}
    >
      <Icon size={22} />
    </HoverMenuButton>
  );
};
