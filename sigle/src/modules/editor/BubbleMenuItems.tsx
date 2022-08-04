import { Editor } from '@tiptap/react';
import { styled } from '../../stitches.config';
import {
  Link1Icon,
  FontBoldIcon,
  FontItalicIcon,
  CodeIcon,
  Cross2Icon,
  StrikethroughIcon,
  UnderlineIcon,
} from '@radix-ui/react-icons';
import { useEffect, useState } from 'react';
import { Flex } from '../../ui';

const BubbleMenuInput = styled('input', {
  fontSize: '14px',
  lineHeight: '18px',
  width: '100%',
  pl: '$2',
  pr: '$1',
  backgroundColor: 'transparent',
  outline: 'none',
});

const BubbleMenuButton = styled('button', {
  color: '$gray12',

  '@xl': {
    color: '$gray1',
  },

  variants: {
    active: {
      true: {
        color: '$orange10',
      },
    },
  },
});

interface BubbleMenuItemsProps {
  editor: Editor;
  iconSize?: number;
}

export const BubbleMenuItems = ({
  editor,
  iconSize = 18,
}: BubbleMenuItemsProps) => {
  const [linkState, setLinkState] = useState({ open: false, value: '' });

  // Listen to any key press to detect cmd + k and activate the link edition
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      // We want all our commands to start with the user pressing ctrl or cmd for mac users
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        onSelectLink();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const onSelectLink = () => {
    // Get href of selected link to pre fill the input
    const existingHref = editor.isActive('link')
      ? editor.getAttributes('link').href
      : '';

    setLinkState({
      open: true,
      value: existingHref,
    });
  };

  const onSubmitLink = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let safeLinkValue = linkState.value.trim();

    if (
      safeLinkValue &&
      !safeLinkValue.startsWith('http') &&
      !safeLinkValue.startsWith('#')
    ) {
      safeLinkValue = `https://${linkState.value}`;
    }

    if (safeLinkValue) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: safeLinkValue })
        // Set the text selection at the end of the link selection
        // that way user can continue to type easily
        .setTextSelection(editor.state.selection.$to.pos)
        // Unset link selection se when the user continues to type it won't be a link
        .unsetLink()
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
    setLinkState({
      open: false,
      value: '',
    });
  };

  return (
    <>
      {!linkState.open ? (
        <>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
          >
            <FontBoldIcon height={iconSize} width={iconSize} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
          >
            <FontItalicIcon height={iconSize} width={iconSize} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
          >
            <UnderlineIcon height={iconSize} width={iconSize} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
          >
            <StrikethroughIcon height={iconSize} width={iconSize} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
          >
            <CodeIcon height={iconSize} width={iconSize} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => onSelectLink()}
            active={editor.isActive('link')}
          >
            <Link1Icon height={iconSize} width={iconSize} />
          </BubbleMenuButton>
        </>
      ) : (
        <Flex as="form" onSubmit={onSubmitLink}>
          <BubbleMenuInput
            value={linkState.value}
            onKeyDown={onKeyDown}
            onChange={(e) =>
              setLinkState((state) => ({ ...state, value: e.target.value }))
            }
            placeholder="Enter link ..."
            autoFocus
          />
          <BubbleMenuButton
            type="button"
            onClick={() => resetLink()}
            active={false}
          >
            <Cross2Icon height={iconSize} width={iconSize} />
          </BubbleMenuButton>
        </Flex>
      )}
    </>
  );
};
