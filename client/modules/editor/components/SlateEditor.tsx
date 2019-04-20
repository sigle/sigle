import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { Editor } from 'slate-react';
import SoftBreak from 'slate-soft-break';
import { Block, Value } from 'slate';
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdFormatQuote,
  MdFormatListNumbered,
  MdFormatListBulleted,
  MdArrowBack,
  MdImage,
  MdLink,
  MdLooksTwo,
  MdLooks3,
  MdLooksOne,
  MdSettings,
} from 'react-icons/md';
import { config } from '../../../config';

const SlateEditorToolbar = styled.div`
  ${tw`py-4 border-b border-solid border-grey flex z-10 bg-grey-light sticky flex justify-between max-w-full overflow-auto`};
  top: 0;

  @media (min-width: ${config.breakpoints.md}px) {
    ${tw`overflow-visible`};
  }
`;

const SlateEditorToolbarButtonContainer = styled.div`
  ${tw`flex`};
`;

const SlateEditorToolbarButton = styled.button`
  ${tw`py-2 px-2 outline-none flex`};
`;

const StyledEditor = styled(Editor)`
  ${tw`py-4`};
  min-height: 150px;
`;

// See https://github.com/ianstormtaylor/slate/blob/master/examples/rich-text/index.js

// TODO add links
// TODO handle cmd+b to set the text to bold for example

const DEFAULT_NODE = 'paragraph';

const schema = {
  document: {
    last: { type: 'paragraph' },
    normalize: (editor: Editor, { code, node }: any) => {
      switch (code) {
        case 'last_child_type_invalid': {
          const paragraph = Block.create('paragraph');
          return editor.insertNodeByKey(node.key, node.nodes.size, paragraph);
        }
      }
    },
  },
  blocks: {
    image: {
      isVoid: true,
    },
  },
};

const emptyNode = {
  document: {
    nodes: [
      {
        object: 'block',
        type: 'paragraph',
        nodes: [
          {
            object: 'text',
            leaves: [
              {
                text: '',
              },
            ],
          },
        ],
      },
    ],
  },
};

const slatePlugins = [SoftBreak({ shift: true })];

export const SlateEditor = () => {
  const editorRef = useRef<any>(null);
  const [value, setValue] = useState(Value.fromJSON(emptyNode));

  if (!process.browser) {
    return null;
  }

  const handleTextChange = ({ value }: { value: Value }) => {
    setValue(value);
  };

  const insertImage = (editor: Editor, src: string, target: any) => {
    if (target) {
      editor.select(target);
    }

    editor.insertBlock({
      type: 'image',
      data: { src },
    });
  };

  const wrapLink = (editor: Editor, href: string) => {
    editor.wrapInline({
      type: 'link',
      data: { href },
    });

    editor.moveToEnd();
  };

  const unwrapLink = (editor: Editor) => {
    editor.unwrapInline('link');
  };

  const onClickImage = (event: any) => {
    event.preventDefault();
    const src = window.prompt('Enter the URL of the image:');
    if (!src) {
      return;
    }
    editorRef.current.command(insertImage, src);
  };

  const onClickLink = (event: any) => {
    event.preventDefault();

    const editor = editorRef.current;
    const { value } = editor;

    if (hasLinks()) {
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

  const onClickMark = (event: any, type: string) => {
    event.preventDefault();
    editorRef.current.toggleMark(type);
  };

  const onClickBlock = (event: any, type: string) => {
    event.preventDefault();

    const editor = editorRef.current;
    const { value } = editor;
    const { document } = value;

    // Handle everything but list buttons.
    if (type != 'bulleted-list' && type != 'numbered-list') {
      const isActive = hasBlock(type);
      const isList = hasBlock('list-item');

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
      const isList = hasBlock('list-item');
      const isType = value.blocks.some((block: any) => {
        return !!document.getClosest(
          block.key,
          (parent: any) => parent.type == type
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
            type == 'bulleted-list' ? 'numbered-list' : 'bulleted-list'
          )
          .wrapBlock(type);
      } else {
        editor.setBlocks('list-item').wrapBlock(type);
      }
    }
  };

  /**
   * Handle key press from the user and allow shortcuts
   */
  const onKeyDown = (event: any, editor: Editor, next: () => any) => {
    // We want all our commands to start with the user pressing ctrl or cmd for mac users
    if (!event.ctrlKey && !event.metaKey) {
      return next();
    }

    let mark: string;
    if (event.key === 'b') {
      mark = 'bold';
    } else if (event.key === 'i') {
      mark = 'italic';
    } else if (event.key === 'u') {
      mark = 'underlined';
    } else {
      return next();
    }

    event.preventDefault();
    editor.toggleMark(mark);
  };

  /**
   * Check if the current selection has a mark with `type` in it.
   */
  const hasMark = (type: string) => {
    return value.activeMarks.some((mark: any) => mark.type == type);
  };

  /**
   * Check if the any of the currently selected blocks are of `type`.
   */
  const hasBlock = (type: string) => {
    return value.blocks.some((node: any) => node.type == type);
  };

  const hasLinks = () => {
    return value.inlines.some(inline => !!(inline && inline.type == 'link'));
  };

  /**
   * Render a Slate node.
   */
  const renderNode = (props: any, _: any, next: any) => {
    const { attributes, children, node, isFocused } = props;

    switch (node.type) {
      case 'paragraph':
        return <p {...attributes}>{children}</p>;
      case 'block-quote':
        return <blockquote {...attributes}>{children}</blockquote>;
      case 'heading-one':
        return <h1 {...attributes}>{children}</h1>;
      case 'heading-two':
        return <h2 {...attributes}>{children}</h2>;
      case 'heading-three':
        return <h3 {...attributes}>{children}</h3>;
      case 'list-item':
        return <li {...attributes}>{children}</li>;
      case 'numbered-list':
        return <ol {...attributes}>{children}</ol>;
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>;
      // case 'image':
      //   const src = node.data.get('src');
      //   return <Image src={src} selected={isFocused} {...attributes} />;
      case 'link': {
        const href = node.data.get('href');
        return (
          <a {...attributes} href={href}>
            {children}
          </a>
        );
      }
      default:
        return next();
    }
  };

  /**
   * Render a Slate mark.
   */
  const renderMark = (props: any, _: any, next: any) => {
    const { children, mark, attributes } = props;

    switch (mark.type) {
      case 'bold':
        return <strong {...attributes}>{children}</strong>;
      case 'italic':
        return <em {...attributes}>{children}</em>;
      case 'underlined':
        return <u {...attributes}>{children}</u>;
      default:
        return next();
    }
  };

  const renderMarkButton = (type: string, Icon: any) => {
    const isActive = hasMark(type);

    return (
      <SlateEditorToolbarButton onMouseDown={event => onClickMark(event, type)}>
        <Icon color={isActive ? '#000000' : '#bbbaba'} size={18} />
      </SlateEditorToolbarButton>
    );
  };

  const renderBlockButton = (type: string, Icon: any) => {
    const isActive = hasBlock(type);

    return (
      <SlateEditorToolbarButton
        onMouseDown={event => onClickBlock(event, type)}
      >
        <Icon color={isActive ? '#000000' : '#bbbaba'} size={18} />
      </SlateEditorToolbarButton>
    );
  };

  console.log(value);

  return (
    <React.Fragment>
      <SlateEditorToolbar>
        <SlateEditorToolbarButtonContainer>
          {renderMarkButton('bold', MdFormatBold)}
          {renderMarkButton('italic', MdFormatItalic)}
          {renderMarkButton('underlined', MdFormatUnderlined)}
          {renderBlockButton('block-quote', MdFormatQuote)}
          {renderBlockButton('heading-one', MdLooksOne)}
          {renderBlockButton('heading-two', MdLooksTwo)}
          {renderBlockButton('heading-three', MdLooks3)}
          {renderBlockButton('numbered-list', MdFormatListNumbered)}
          {renderBlockButton('bulleted-list', MdFormatListBulleted)}
          <SlateEditorToolbarButton onMouseDown={onClickLink}>
            <MdLink color={'#b8c2cc'} size={18} />
          </SlateEditorToolbarButton>
          <SlateEditorToolbarButton onMouseDown={onClickImage}>
            <MdImage color={'#b8c2cc'} size={18} />
          </SlateEditorToolbarButton>
        </SlateEditorToolbarButtonContainer>
      </SlateEditorToolbar>

      <StyledEditor
        ref={editorRef}
        plugins={slatePlugins}
        value={value}
        onChange={handleTextChange}
        onKeyDown={onKeyDown}
        schema={schema}
        placeholder="Text"
        renderNode={renderNode}
        renderMark={renderMark}
      />
    </React.Fragment>
  );
};
