import React, { forwardRef, useState } from 'react';
import { Editor } from 'slate-react';
import ReactDOM from 'react-dom';
import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';
import { MdAdd, MdAddAPhoto } from 'react-icons/md';
import { onClickImage } from './SlateEditorToolbar';

const SideMenuContainer = styled.div`
  ${tw`flex absolute`};
  top: -10000px;
  left: -10000px;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.75s;
`;

const SideMenuButtonContainer = styled.div<{ open: boolean }>`
  ${tw`pl-6`};
  margin-left: -1000px;
  ${props =>
    props.open &&
    css`
      margin-left: 0;
    `}
`;

const SideMenuButton = styled.div`
  ${tw`flex items-center justify-center cursor-pointer`};
  border: 1px solid black;
  height: 29px;
  width: 29px;
  transition: transform 0.25s;
  border-radius: 50%;
`;

const SideMenuOpenButton = styled(SideMenuButton)<{ open: boolean }>`
  ${props =>
    props.open &&
    css`
      transform: rotate(45deg);
    `}
`;

const SideMenuActionButton = styled(SideMenuButton)<{ open: boolean }>`
  transform: scale(0);
  transition: transform 0.15s;
  ${props =>
    props.open &&
    css`
      transform: scale(1);
    `}
`;

interface SlateEditorSideMenuProps {
  editor: Editor;
}

export const SlateEditorSideMenu = forwardRef(
  ({ editor }: SlateEditorSideMenuProps, ref: any) => {
    const [open, setOpen] = useState(false);

    const root = window.document.getElementById('__next');
    if (!root) return null;

    return ReactDOM.createPortal(
      <SideMenuContainer ref={ref}>
        <SideMenuOpenButton
          open={open}
          onMouseDown={e => {
            e.preventDefault();
            setOpen(!open);
          }}
        >
          <MdAdd size={20} />
        </SideMenuOpenButton>

        <SideMenuButtonContainer open={open}>
          <SideMenuActionButton
            open={open}
            onClick={() => onClickImage(editor)}
          >
            <MdAddAPhoto size={18} />
          </SideMenuActionButton>
        </SideMenuButtonContainer>
      </SideMenuContainer>,
      root
    );
  }
);

SlateEditorSideMenu.displayName = 'SlateEditorSideMenu';
