import React from 'react';
import { Editor } from 'slate-react';
import { hasBlock, DEFAULT_NODE } from './utils';
import { MarkButtonProps, StyledMarButton } from './SlateMarkButton';

const onClickBlock = (editor: Editor, type: string) => {
  const { value } = editor;
  const { document } = value;

  // Handle everything but list buttons.
  if (type !== 'bulleted-list' && type !== 'numbered-list') {
    const isActive = hasBlock(value, type);
    const isList = hasBlock(value, 'list-item');

    if (isList) {
      editor
        .setBlocks(isActive ? DEFAULT_NODE : type)
        .unwrapBlock('bulleted-list')
        .unwrapBlock('numbered-list');
    } else {
      editor.setBlocks(isActive ? DEFAULT_NODE : type);
    }
  } else {
    // Handle the extra wrapping required for list buttons.
    const isList = hasBlock(value, 'list-item');
    const isType = value.blocks.some((block: any) => {
      return !!document.getClosest(
        block.key,
        (parent: any) => parent.type === type
      );
    });

    if (isList && isType) {
      editor
        .setBlocks(DEFAULT_NODE)
        .unwrapBlock('bulleted-list')
        .unwrapBlock('numbered-list');
    } else if (isList) {
      editor
        .unwrapBlock(
          type === 'bulleted-list' ? 'numbered-list' : 'bulleted-list'
        )
        .wrapBlock(type);
    } else {
      editor.setBlocks('list-item').wrapBlock(type);
    }
  }
};

export const SlateBlockButton = ({
  editor,
  type,
  icon: Icon,
  iconSize = 22,
  component,
}: MarkButtonProps) => {
  const { value } = editor;
  let isActive = hasBlock(value, type);

  if (['numbered-list', 'bulleted-list'].includes(type)) {
    const { value } = editor;
    const { document, blocks } = value;

    if (blocks.size > 0) {
      const parent = document.getParent(blocks.first().key);
      isActive =
        hasBlock(value, 'list-item') &&
        !!parent &&
        (parent as any).type === type;
    }
  }

  return (
    <StyledMarButton
      active={isActive}
      component={component}
      onMouseDown={event => {
        event.preventDefault();
        onClickBlock(editor, type);
      }}
    >
      <Icon size={iconSize} />
    </StyledMarButton>
  );
};
