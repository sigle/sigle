import { useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { Cross2Icon } from '@radix-ui/react-icons';
import { styled } from '../../../stitches.config';
import { Flex } from '../../../ui';
import { useBubbleMenuStore } from './store';

const BubbleMenuButton = styled('button', {
  color: '$gray1',
});

const BubbleMenuInput = styled('input', {
  width: '100%',
  pl: '$2',
  pr: '$1',
  backgroundColor: 'transparent',
  outline: 'none',
});

interface EditorBubbleMenuProps {
  editor: Editor;
}

export const EditorBubbleMenuLink = ({ editor }: EditorBubbleMenuProps) => {
  const linkValue = useBubbleMenuStore((state) => state.linkValue);
  const setLinkValue = useBubbleMenuStore((state) => state.setLinkValue);
  const toggleLink = useBubbleMenuStore((state) => state.toggleLink);

  // When the link bubble menu is opened we set the input value to the current link
  useEffect(() => {
    const existingHref = editor.isActive('link')
      ? editor.getAttributes('link').href
      : '';
    setLinkValue(existingHref);

    // When the link bubble menu is closed we reset the input value
    return () => {
      setLinkValue('');
    };
  }, []);

  const onSubmitLink = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let safeLinkValue = linkValue.trim();

    if (
      safeLinkValue &&
      !safeLinkValue.startsWith('http') &&
      !safeLinkValue.startsWith('#')
    ) {
      safeLinkValue = `https://${linkValue}`;
    }

    if (safeLinkValue) {
      const pos = editor.state.selection.$head;
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: safeLinkValue })
        // Set the text selection at the end of the link selection
        // that way user can continue to type easily
        .setTextSelection(pos.end())
        // Unset link selection se when the user continues to type it won't be a link
        // We are using `unsetMark` instead of `unsetLink` to avoid the full selection to be unlinked
        .unsetMark('link')
        .run();
    } else {
      // If input text is empty we unset the link
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }

    resetLink();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    // If user press escape we hide the link input
    if (event.key === 'Escape') {
      event.preventDefault();
      resetLink();
    }
  };

  const resetLink = () => {
    toggleLink(false);
    setLinkValue('');
  };

  return (
    <Flex as="form" onSubmit={onSubmitLink}>
      <BubbleMenuInput
        value={linkValue}
        onKeyDown={onKeyDown}
        onChange={(e) => setLinkValue(e.target.value)}
        placeholder="Enter link ..."
        autoFocus
      />
      <BubbleMenuButton type="button" onClick={() => resetLink()}>
        <Cross2Icon height={18} width={18} />
      </BubbleMenuButton>
    </Flex>
  );
};
