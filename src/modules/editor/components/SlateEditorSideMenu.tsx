import React from 'react';
import { Editor } from 'slate-react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { MdAddAPhoto } from 'react-icons/md';

const SideMenuContainer = styled.div`
  ${tw`flex items-center justify-center cursor-pointer absolute`};
  top: -10000px;
  left: -10000px;
  border: 1px solid black;
  position: absolute;
  z-index: 1;
  height: 29px;
  width: 29px;
  transition: opacity 0.75s;
  opacity: 0;
  border-radius: 50%;
`;

interface SlateEditorSideMenuProps {
  editor: Editor;
  onClick: () => void;
}

export const SlateEditorSideMenu = React.forwardRef(
  ({ onClick }: SlateEditorSideMenuProps, ref: any) => {
    const root = window.document.getElementById('__next');
    if (!root) return null;

    return ReactDOM.createPortal(
      <SideMenuContainer ref={ref} onClick={onClick}>
        <MdAddAPhoto size={18} />
      </SideMenuContainer>,
      root
    );
  }
);
