import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';
import {
  Editor,
  RenderBlockProps,
  RenderMarkProps,
  getEventTransfer,
  EditorProps,
  RenderInlineProps,
} from 'slate-react';
import SoftBreak from 'slate-soft-break';
import { Block, Value } from 'slate';
import { IconType } from 'react-icons';
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdFormatQuote,
  MdFormatListNumbered,
  MdFormatListBulleted,
  MdLink,
  MdLooksTwo,
  MdLooksOne,
} from 'react-icons/md';
import { getConfig } from 'radiks';
import { hasBlock, hasMark, hasLinks } from './utils';

const SlateEditorToolbar = styled.div`
  ${tw`py-4 border-b border-solid border-grey flex z-10 bg-white sticky flex justify-between max-w-full overflow-auto md:hidden`};
  top: 60px;
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

const Image = styled.img<{ selected: boolean }>`
  display: block;
  max-width: 100%;
  margin: auto;
  box-shadow: ${props => (props.selected ? '0 0 0 1px #000000;' : 'none')};
`;

const EditorStyle = styled.div<{ isDragging: boolean }>`
  ${props =>
    props.isDragging &&
    css`
      margin: -2px;
      border-width: 2px;
      border-radius: 2px;
      border-color: #eeeeee;
      border-style: dashed;
    `}

  ${tw`text-base leading-tight`};

  p,
  ol,
  ul {
    ${tw`mb-4`};
  }

  li + li {
    ${tw`mt-2`};
  }

  blockquote {
    ${tw`mb-4 py-4 px-4 italic text-sm`};
    border-left: 3px solid #ccc;
    letter-spacing: 0.01rem;
  }

  h1 {
    ${tw`mt-6 mb-4 text-4xl`};
  }

  h2 {
    ${tw`mt-6 mb-4 text-3xl`};
  }

  h3 {
    ${tw`mt-6 mb-4 text-2xl`};
  }

  a {
    ${tw`underline text-primary`};
  }
`;

// See https://github.com/ianstormtaylor/slate/blob/master/examples/rich-text/index.js

const DEFAULT_NODE = 'paragraph';

const schema = {
  document: {
    last: { type: 'paragraph' },
    normalize: (editor: Editor, { code, node }: any) => {
      switch (code) {
        case 'last_child_type_invalid': {
          const paragraph = Block.create('paragraph');
          return editor.insertNodeByKey(
            node.key,
            node.nodes.size,
            // TODO fix type
            paragraph as any
          );
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
            text: '',
          },
        ],
      },
    ],
  },
};

const slatePlugins = [SoftBreak({ shift: true })];

const Menu = styled.div`
  ${tw`flex`};
  padding: 8px 7px 6px;
  position: absolute;
  z-index: 1;
  top: -10000px;
  left: -10000px;
  margin-top: -6px;
  opacity: 0;
  background-color: #222;
  border-radius: 4px;
  transition: opacity 0.75s;
`;

const MenuButton = styled.div<{ active: boolean }>`
  ${tw`text-white cursor-pointer`};
  padding-left: 0.3rem;
  padding-right: 0.3rem;
  ${props =>
    props.active &&
    css`
      ${tw`text-primary`};
    `}
`;

interface MarkButtonProps {
  editor: Editor;
  type: string;
  icon: IconType;
}

const onClickMark = (editor: Editor, type: string) => {
  editor.toggleMark(type);
};

const MarkButton = ({ editor, type, icon: Icon }: MarkButtonProps) => {
  const { value } = editor;
  const isActive = hasMark(value, type);
  return (
    <MenuButton
      active={isActive}
      onMouseDown={event => {
        event.preventDefault();
        onClickMark(editor, type);
      }}
    >
      <Icon size={22} />
    </MenuButton>
  );
};

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

const BlockButton = ({ editor, type, icon: Icon }: MarkButtonProps) => {
  const { value } = editor;
  let isActive = hasBlock(value, type);

  if (['numbered-list', 'bulleted-list'].includes(type)) {
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
    <MenuButton
      active={isActive}
      onMouseDown={event => {
        event.preventDefault();
        onClickBlock(editor, type);
      }}
    >
      <Icon size={22} />
    </MenuButton>
  );
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

// TODO onPaste for links see https://github.com/ianstormtaylor/slate/blob/master/examples/links/index.js
const onClickLink = (editor: Editor) => {
  const { value } = editor;

  if (hasLinks(value)) {
    editor.command(unwrapLink as any);
  } else if (value.selection.isExpanded) {
    const href = window.prompt('Enter the URL of the link:');

    if (href === null) {
      return;
    }

    editor.command(wrapLink as any, href);
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
      .command(wrapLink as any, href);
  }
};

interface LinkButtonProps {
  editor: Editor;
}

const LinkButton = ({ editor }: LinkButtonProps) => {
  const { value } = editor;
  const isActive = hasLinks(value);
  return (
    <MenuButton
      active={isActive}
      onMouseDown={event => {
        event.preventDefault();
        onClickLink(editor);
      }}
    >
      <MdLink size={22} />
    </MenuButton>
  );
};

interface HoverMenuProps {
  editor: Editor;
}

const HoverMenu = React.forwardRef<{}, HoverMenuProps>(
  ({ editor }, ref: any) => {
    const root = window.document.getElementById('__next');
    if (!root) return null;

    return ReactDOM.createPortal(
      <Menu ref={ref}>
        <MarkButton editor={editor} type="bold" icon={MdFormatBold} />
        <MarkButton editor={editor} type="italic" icon={MdFormatItalic} />
        <MarkButton
          editor={editor}
          type="underlined"
          icon={MdFormatUnderlined}
        />
        <BlockButton editor={editor} type="block-quote" icon={MdFormatQuote} />
        <BlockButton editor={editor} type="heading-one" icon={MdLooksOne} />
        <BlockButton editor={editor} type="heading-two" icon={MdLooksTwo} />
        <BlockButton
          editor={editor}
          type="numbered-list"
          icon={MdFormatListNumbered}
        />
        <BlockButton
          editor={editor}
          type="bulleted-list"
          icon={MdFormatListBulleted}
        />
        <LinkButton editor={editor} />
      </Menu>,
      root
    );
  }
);

HoverMenu.displayName = 'HoverMenu';

interface Props {
  story: any;
  onChangeContent: (value: Value) => void;
}

export const SlateEditor = ({ story, onChangeContent }: Props) => {
  const editorRef = useRef<any>(null);
  const menuRef = useRef<any>(null);
  const [value, setValue] = useState(
    story.attrs.content
      ? // TODO error catching of JSON.parse and fromJSON
        Value.fromJSON(JSON.parse(story.attrs.content))
      : // TODO fix type
        Value.fromJSON(emptyNode as any)
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);

  /**
   * Update the menu's absolute position.
   */
  const updateMenu = (value: Value) => {
    const menu = menuRef.current;
    if (!menu) return;

    const { fragment, selection } = value;

    if (selection.isBlurred || selection.isCollapsed || fragment.text === '') {
      menu.removeAttribute('style');
      return;
    }

    const native = window.getSelection();
    if (!native) return;
    const range = native.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    menu.style.opacity = 1;
    menu.style.top = `${rect.top + window.pageYOffset - menu.offsetHeight}px`;

    menu.style.left = `${rect.left +
      window.pageXOffset -
      menu.offsetWidth / 2 +
      rect.width / 2}px`;
  };

  const handleTextChange = ({ value }: { value: Value }) => {
    setValue(value);
    onChangeContent(value);
    updateMenu(value);
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

  const onDrop = async (event: any, editor: any, next: () => any) => {
    const target = editor.findEventRange(event);
    if (!target && event.type === 'drop') return next();

    // In order to remove the styles we force isDragging to be false
    setTimeout(() => {
      setIsDragging(false);
    }, 100);

    const transfer: any = getEventTransfer(event);
    const { type, files } = transfer;

    if (type === 'files') {
      for (const file of files) {
        const reader = new FileReader();
        const [mime] = file.type.split('/');
        if (mime !== 'image') continue;

        // TODO find a way to visually show that a file is uploading

        const { userSession } = getConfig();
        const now = new Date().getTime();
        const name = `photos/${story.attrs._id}/${now}-${file.name}`;
        const imageUrl = await userSession.putFile(name, file, {
          // TODO encrypt if it's a draft or show a message to the user explaining the limitation
          encrypt: false,
          contentType: file.type,
        });

        reader.addEventListener('load', () => {
          editor.command(insertImage, imageUrl, target);
        });

        reader.readAsDataURL(file);
      }
      return;
    }

    next();
  };

  /**
   * Render a mark-toggling toolbar button.
   */
  const renderMarkButton = (type: string, Icon: IconType) => {
    const isActive = hasMark(value, type);

    return (
      <SlateEditorToolbarButton
        onMouseDown={event => {
          event.preventDefault();
          onClickMark(editorRef.current, type);
        }}
      >
        <Icon color={isActive ? '#000000' : '#cccccc'} size={18} />
      </SlateEditorToolbarButton>
    );
  };

  /**
   * Render a block-toggling toolbar button.
   */
  const renderBlockButton = (type: string, Icon: IconType) => {
    let isActive = hasBlock(value, type);

    if (['numbered-list', 'bulleted-list'].includes(type)) {
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
      <SlateEditorToolbarButton
        onMouseDown={event => {
          event.preventDefault();
          onClickBlock(editorRef.current, type);
        }}
      >
        <Icon color={isActive ? '#000000' : '#cccccc'} size={18} />
      </SlateEditorToolbarButton>
    );
  };

  /**
   * Render a mark-toggling toolbar button.
   */
  const renderLinkButton = () => {
    const isActive = hasLinks(value);

    return (
      <SlateEditorToolbarButton
        onMouseDown={event => {
          event.preventDefault();
          onClickLink(editorRef.current);
        }}
      >
        <MdLink color={isActive ? '#000000' : '#cccccc'} size={18} />
      </SlateEditorToolbarButton>
    );
  };

  /**
   * Render a Slate block.
   */
  const renderBlock = (props: RenderBlockProps, _: any, next: () => any) => {
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
      case 'numbered-list':
        return <ol {...attributes}>{children}</ol>;
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>;
      case 'list-item':
        return <li {...attributes}>{children}</li>;
      case 'image':
        const src = node.data.get('src');
        return <Image src={src} selected={isFocused} {...attributes} />;
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
  const renderMark = (props: RenderMarkProps, _: any, next: () => any) => {
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

  /**
   * Render a Slate inline.
   */
  const renderInline = (props: RenderInlineProps, _: any, next: () => any) => {
    const { attributes, children, node } = props;

    switch (node.type) {
      case 'link':
        const { data } = node;
        const href = data.get('href');
        return (
          <a {...attributes} href={href}>
            {children}
          </a>
        );
      default:
        return next();
    }
  };

  /**
   * Render the Editor.
   */
  const renderEditor = (
    props: EditorProps,
    editor: Editor,
    next: () => any
  ) => {
    const children = next();
    return (
      <React.Fragment>
        {children}
        <HoverMenu ref={menuRef} editor={editor} />
      </React.Fragment>
    );
  };

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
          {renderBlockButton('numbered-list', MdFormatListNumbered)}
          {renderBlockButton('bulleted-list', MdFormatListBulleted)}
          {renderLinkButton()}
        </SlateEditorToolbarButtonContainer>
      </SlateEditorToolbar>

      <EditorStyle isDragging={isDragging}>
        <StyledEditor
          ref={editorRef}
          plugins={slatePlugins}
          // TODO fix types
          value={value as any}
          onChange={handleTextChange as any}
          onKeyDown={onKeyDown as any}
          onDrop={onDrop}
          schema={schema as any}
          placeholder="Text"
          renderBlock={renderBlock}
          renderMark={renderMark}
          renderInline={renderInline}
          renderEditor={renderEditor as any}
          onDragOver={() => !isDragging && setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
        />
      </EditorStyle>
    </React.Fragment>
  );
};
