import { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Link1Icon,
  FontBoldIcon,
  FontItalicIcon,
  CodeIcon,
  Cross2Icon,
  StrikethroughIcon,
  UnderlineIcon,
} from '@radix-ui/react-icons';
import { styled } from '../../../stitches.config';
import { Flex } from '../../../ui';

const BubbleMenuButton = styled('button', {
  color: '$gray11',

  variants: {
    active: {
      true: {
        color: '$orange10',
      },
    },
  },
});

const BubbleMenuInput = styled('input', {
  width: '100%',
  pl: '$2',
  pr: '$1',
  backgroundColor: 'transparent',
  outline: 'none',
});

// Maybe can be used on clicks https://github.com/ueberdosis/tiptap/issues/104#issuecomment-912794709

interface BubbleMenuProps {
  editor: Editor;
}

export const ToolbarMenu = ({ editor }: BubbleMenuProps) => {
  const [linkState, setLinkState] = useState({ open: false, value: '' });

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

  const resetLink = () => {
    setLinkState({
      open: false,
      value: '',
    });
  };

  return (
    <Flex
      css={{
        '@supports (-webkit-touch-callout: none) and (not (translate: none))': {
          '& button': {
            mr: '$5',
          },
          mr: '$5',
        },
        display: '-webkit-flex',
      }}
      gap="5"
    >
      {!linkState.open ? (
        <>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
          >
            <FontBoldIcon height={15} width={15} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
          >
            <FontItalicIcon height={15} width={15} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
          >
            <UnderlineIcon height={15} width={15} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
          >
            <StrikethroughIcon height={15} width={15} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
          >
            <CodeIcon height={15} width={15} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => onSelectLink()}
            active={editor.isActive('link')}
          >
            <Link1Icon height={15} width={15} />
          </BubbleMenuButton>
        </>
      ) : (
        <Flex as="form" onSubmit={onSubmitLink}>
          <BubbleMenuInput
            value={linkState.value}
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
            <Cross2Icon height={18} width={18} />
          </BubbleMenuButton>
        </Flex>
      )}
    </Flex>
  );
};
