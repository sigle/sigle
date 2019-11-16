import React from 'react';
import { Editor } from 'slate-react';
import { hasLinks, unwrapLink, wrapLink } from './utils';
import { MarkButtonProps, StyledMarButton } from './SlateMarkButton';
import { MdLink } from 'react-icons/md';

/**
 * When clicking a link, if the selection has a link in it, remove the link.
 * Otherwise, add a new link with an href and text.
 */
// TODO onPaste for links see https://github.com/ianstormtaylor/slate/blob/master/examples/links/index.js
const onClickLink = (editor: Editor) => {
  const { value } = editor;

  if (hasLinks(value)) {
    editor.command(unwrapLink);
  } else if (value.selection.isExpanded) {
    const href = window.prompt('Enter the URL of the link:');

    if (href === null) {
      return;
    }

    editor.command(wrapLink, href);
  } else {
    const href = window.prompt('Enter the URL of the link:');

    if (href === null) {
      return;
    }

    const text = window.prompt('Enter the text for the link:');

    if (text === null) {
      return;
    }

    editor
      .insertText(text)
      .moveFocusBackward(text.length)
      .command(wrapLink, href);
  }
};

export const SlateLinkButton = ({
  editor,
  type,
  icon: Icon,
  iconSize = 22,
  component,
}: MarkButtonProps) => {
  const { value } = editor;
  const isActive = hasLinks(value);

  return (
    <StyledMarButton
      active={isActive}
      component={component}
      onMouseDown={event => {
        event.preventDefault();
        onClickLink(editor);
      }}
    >
      <Icon size={iconSize} />
    </StyledMarButton>
  );
};
