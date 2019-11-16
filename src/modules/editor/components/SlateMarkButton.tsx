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
  iconSize?: number;
  component: 'hover' | 'toolbar';
}

const StyledMarButton = styled.div<{
  component: 'hover' | 'toolbar';
  active: boolean;
}>`
  ${props =>
    props.component === 'hover' &&
    css`
      ${tw`text-white cursor-pointer`};
      padding-left: 0.3rem;
      padding-right: 0.3rem;
    `}

  ${props =>
    props.component === 'hover' &&
    props.active &&
    css`
      ${tw`text-pink`};
    `}

  ${props =>
    props.component === 'toolbar' &&
    css`
      ${tw`py-2 px-2 outline-none flex text-grey-dark`};
    `}

    ${props =>
      props.component === 'toolbar' &&
      props.active &&
      css`
        ${tw`text-black`};
      `}
`;

const onClickMark = (editor: Editor, type: string) => {
  editor.toggleMark(type);
};

export const SlateMarkButton = ({
  editor,
  type,
  icon: Icon,
  iconSize = 22,
  component,
}: MarkButtonProps) => {
  const { value } = editor;
  const isActive = hasMark(value, type);

  return (
    <StyledMarButton
      active={isActive}
      component={component}
      onMouseDown={event => {
        event.preventDefault();
        onClickMark(editor, type);
      }}
    >
      <Icon size={iconSize} />
    </StyledMarButton>
  );
};
