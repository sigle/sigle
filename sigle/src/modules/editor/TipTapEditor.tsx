import {
  useEditor,
  EditorContent,
  BubbleMenu,
  FloatingMenu,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  MdCode,
  MdFormatBold,
  MdFormatItalic,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatQuote,
  MdLooks3,
  MdLooksOne,
  MdLooksTwo,
} from 'react-icons/md';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';

const StyledBubbleMenu = styled(BubbleMenu)`
  ${tw`flex rounded`};
  background-color: #222;
  // padding: 8px 7px 6px;
  // border-radius: 4px;
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

export const TipTapEditor = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello World! 🌎️</p>',
  });

  return (
    <>
      {editor && (
        <StyledBubbleMenu tippyOptions={{ duration: 100 }} editor={editor}>
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
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('underline')}
          >
            Underline TODO
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
        </StyledBubbleMenu>
      )}
      <EditorContent editor={editor} />
    </>
  );
};
