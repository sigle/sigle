import { useState } from 'react';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';
import { Editor, BubbleMenu as TipTapBubbleMenu } from '@tiptap/react';
import {
  MdCode,
  MdFormatBold,
  MdFormatItalic,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatQuote,
  MdFormatUnderlined,
  MdLink,
  MdLooks3,
  MdLooksOne,
  MdLooksTwo,
} from 'react-icons/md';

const StyledBubbleMenu = styled(TipTapBubbleMenu)`
  ${tw`flex rounded py-1`};
  background-color: #222;
`;

const BubbleMenuButton = styled.button<{ active: boolean }>`
  ${tw`text-white cursor-pointer`};
  padding-left: 0.3rem;
  padding-right: 0.3rem;

  ${(props) =>
    props.active &&
    css`
      ${tw`text-pink`};
    `}
`;

const BubbleMenuInput = styled.input`
  ${tw`outline-none w-full bg-transparent	px-2`};
`;

// TODO close icon to go back to previous state
// TODO cmd + k should open UI for links
// TODO when bubble menu close reset state isLinkOpen to false
// Maybe can be used on clicks https://github.com/ueberdosis/tiptap/issues/104#issuecomment-912794709

interface BubbleMenuProps {
  editor: Editor;
}

export const BubbleMenu = ({ editor }: BubbleMenuProps) => {
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState('');

  const onSelectLink = () => {
    // Get href of selected link to pre fill the input
    const existingHref = editor.isActive('link')
      ? editor.getAttributes('link').href
      : '';

    setLinkValue(existingHref);
    setIsLinkOpen(true);

    // TODO focus input
  };

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
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: safeLinkValue })
        .run();
    } else {
      // If input text is empty we unset the link
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }

    setIsLinkOpen(false);
    setLinkValue('');
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    // If user press escape we hide the link input
    if (event.key === 'Escape') {
      event.preventDefault();
      setIsLinkOpen(false);
      setLinkValue('');
    }
  };

  return (
    <StyledBubbleMenu tippyOptions={{ duration: 100 }} editor={editor}>
      {!isLinkOpen ? (
        <>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
          >
            <MdFormatBold size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
          >
            <MdFormatItalic size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
          >
            <MdFormatUnderlined size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
          >
            <MdCode size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
          >
            <MdFormatQuote size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            active={editor.isActive('heading', { level: 1 })}
          >
            <MdLooksOne size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor.isActive('heading', { level: 2 })}
          >
            <MdLooksTwo size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            active={editor.isActive('heading', { level: 3 })}
          >
            <MdLooks3 size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
          >
            <MdFormatListNumbered size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
          >
            <MdFormatListBulleted size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => onSelectLink()}
            active={editor.isActive('link')}
          >
            <MdLink size={18} />
          </BubbleMenuButton>
        </>
      ) : (
        // TODO nice animation when we show the link?
        <form onSubmit={onSubmitLink}>
          <BubbleMenuInput
            value={linkValue}
            onKeyDown={onKeyDown}
            onChange={(e) => setLinkValue(e.target.value)}
            placeholder="Enter link ..."
          />
        </form>
      )}
    </StyledBubbleMenu>
  );
};
