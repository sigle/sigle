import React, { forwardRef, useState, useRef } from 'react';
import { Editor } from 'slate-react';
import ReactDOM from 'react-dom';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';
import { MdAdd, MdAddAPhoto } from 'react-icons/md';

const SideMenuContainer = styled.div`
  ${tw`flex absolute transition-opacity duration-700`};
  top: -10000px;
  left: -10000px;
  z-index: 1;
  opacity: 0;
`;

const SideMenuButtonContainer = styled.div<{ open: boolean }>`
  ${tw`pl-6`};
  margin-left: -1000px;
  ${(props) =>
    props.open &&
    css`
      margin-left: 0;
    `}
`;

const SideMenuButton = styled.div`
  ${tw`flex items-center justify-center cursor-pointer transition-transform duration-200`};
  border: 1px solid black;
  height: 29px;
  width: 29px;
  border-radius: 50%;
`;

const SideMenuOpenButton = styled(SideMenuButton)<{ open: boolean }>`
  ${(props) =>
    props.open &&
    css`
      transform: rotate(45deg);
    `}
`;

const SideMenuActionButton = styled(SideMenuButton)<{ open: boolean }>`
  ${tw`flex absolute transition-transform duration-200 scale-0`};
  ${(props) =>
    props.open &&
    css`
      ${tw`flex absolute transition-transform duration-200 scale-100`};
    `}
`;

interface SlateEditorSideMenuProps {
  editor: Editor;
  addImageToEditor: (editor: Editor, files: File[], target?: any) => void;
}

export const SlateEditorSideMenu = forwardRef(
  ({ editor, addImageToEditor }: SlateEditorSideMenuProps, ref: any) => {
    const [open, setOpen] = useState(false);
    const fileUploaderRef = useRef<HTMLInputElement>(null);

    const root = window.document.getElementById('__next');
    if (!root) return null;

    return ReactDOM.createPortal(
      <SideMenuContainer ref={ref}>
        <SideMenuOpenButton
          open={open}
          onMouseDown={(e) => {
            e.preventDefault();
            setOpen(!open);
          }}
        >
          <MdAdd size={20} />
        </SideMenuOpenButton>

        <SideMenuButtonContainer open={open}>
          <SideMenuActionButton
            open={open}
            onClick={() =>
              fileUploaderRef.current && fileUploaderRef.current.click()
            }
          >
            <input
              type="file"
              accept="image/jpeg, image/png"
              onChange={(event) =>
                addImageToEditor(editor, event.target.files as any)
              }
              ref={fileUploaderRef}
              style={{ display: 'none' }}
            />
            <MdAddAPhoto size={18} />
          </SideMenuActionButton>
        </SideMenuButtonContainer>
      </SideMenuContainer>,
      root
    );
  }
);

SlateEditorSideMenu.displayName = 'SlateEditorSideMenu';
