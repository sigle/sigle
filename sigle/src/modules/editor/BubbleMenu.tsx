import { useState } from 'react';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';
import { Editor, BubbleMenu as TipTapBubbleMenu } from '@tiptap/react';
import {
  ListBulletIcon,
  Link1Icon,
  FontBoldIcon,
  FontItalicIcon,
  CodeIcon,
  QuoteIcon,
  Cross2Icon,
} from '@radix-ui/react-icons';
import {
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListNumberedIcon,
} from '../../icons';

const StyledBubbleMenu = styled(TipTapBubbleMenu)`
  ${tw`flex rounded py-1`};
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

const BubbleMenuFormLink = styled.form`
  ${tw`flex`};
`;

const BubbleMenuInput = styled.input`
  ${tw`outline-none w-full bg-transparent	pl-2 pr-1`};
`;

// TODO cmd + k should open UI for links
// TODO show link on hover so user can see the value
// Maybe can be used on clicks https://github.com/ueberdosis/tiptap/issues/104#issuecomment-912794709
// TODO When we set the link set selection after the link and remove hover so user can continue to type

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
    setIsLinkOpen(false);
    setLinkValue('');
  };

  return (
    <StyledBubbleMenu
      tippyOptions={{ duration: 100, onHidden: () => resetLink() }}
      editor={editor}
    >
      {!isLinkOpen ? (
        <>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
          >
            <FontBoldIcon height={18} width={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
          >
            <FontItalicIcon height={18} width={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
          >
            <CodeIcon height={18} width={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
          >
            <QuoteIcon height={18} width={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            active={editor.isActive('heading', { level: 1 })}
          >
            <Heading1Icon height={18} width={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor.isActive('heading', { level: 2 })}
          >
            <Heading2Icon height={18} width={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            active={editor.isActive('heading', { level: 3 })}
          >
            <Heading3Icon height={18} width={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
          >
            <ListNumberedIcon height={18} width={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
          >
            <ListBulletIcon height={18} width={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => onSelectLink()}
            active={editor.isActive('link')}
          >
            <Link1Icon height={18} width={18} />
          </BubbleMenuButton>
        </>
      ) : (
        <BubbleMenuFormLink onSubmit={onSubmitLink}>
          <BubbleMenuInput
            value={linkValue}
            onKeyDown={onKeyDown}
            onChange={(e) => setLinkValue(e.target.value)}
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
        </BubbleMenuFormLink>
      )}
    </StyledBubbleMenu>
  );
};
