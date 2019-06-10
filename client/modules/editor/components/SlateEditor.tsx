import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { Editor, RenderBlockProps, RenderMarkProps } from 'slate-react';
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
  MdImage,
  MdLink,
  MdLooksTwo,
  MdLooks3,
  MdLooksOne,
  MdSettings,
} from 'react-icons/md';
import { config } from '../../../config';

const SlateEditorToolbar = styled.div`
  ${tw`py-4 border-b border-solid border-grey flex z-10 bg-white sticky flex justify-between max-w-full overflow-auto`};
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

const SlateToolbarActionContainer = styled.div`
  ${tw`flex items-center`};
`;

const SlateToolbarActionIcon = styled.div`
  ${tw`p-2 -mr-2 flex items-center cursor-pointer text-primary`};
`;

const SlateToolbarActionMessage = styled.div`
  ${tw`text-grey-dark lg:text-sm`};
`;

const StyledEditor = styled(Editor)`
  ${tw`py-4`};
  min-height: 150px;
`;

const EditorStyle = styled.div`
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

interface Props {
  story: any;
  state: any;
  onChangeContent: any;
  onOpenOptions: () => void;
}

export const SlateEditor = ({
  story,
  state,
  onChangeContent,
  onOpenOptions,
}: Props) => {
  const editorRef = useRef<any>(null);
  const [value, setValue] = useState(
    story.attrs.content
      ? // TODO error catching of JSON.parse and fromJSON
        Value.fromJSON(JSON.parse(story.attrs.content))
      : // TODO fix type
        Value.fromJSON(emptyNode as any)
  );

  const handleTextChange = ({ value }: { value: Value }) => {
    setValue(value);
    onChangeContent(value);
  };

  /**
   * Check if the current selection has a mark with `type` in it.
   */
  const hasMark = (type: string) => {
    return value.activeMarks.some(mark => !!mark && mark.type === type);
  };

  /**
   * Check if the any of the currently selected blocks are of `type`.
   */
  const hasBlock = (type: string) => {
    return value.blocks.some(node => !!node && node.type === type);
  };

  const hasLinks = () => {
    return value.inlines.some(inline => !!(inline && inline.type == 'link'));
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

  const onClickImage = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    const src = window.prompt('Enter the URL of the image:');
    if (!src) {
      return;
    }
    editorRef.current.command(insertImage, src);
  };

  const onClickLink = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
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

  const onClickMark = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    type: string
  ) => {
    event.preventDefault();
    editorRef.current.toggleMark(type);
  };

  const onClickBlock = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    type: string
  ) => {
    event.preventDefault();

    const editor = editorRef.current;
    const { value } = editor;
    const { document } = value;

    // Handle everything but list buttons.
    if (type !== 'bulleted-list' && type !== 'numbered-list') {
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
   * Render a mark-toggling toolbar button.
   */
  const renderMarkButton = (type: string, Icon: IconType) => {
    const isActive = hasMark(type);

    return (
      <SlateEditorToolbarButton onMouseDown={event => onClickMark(event, type)}>
        <Icon color={isActive ? '#000000' : '#cccccc'} size={18} />
      </SlateEditorToolbarButton>
    );
  };

  /**
   * Render a block-toggling toolbar button.
   */
  const renderBlockButton = (type: string, Icon: IconType) => {
    let isActive = hasBlock(type);

    if (['numbered-list', 'bulleted-list'].includes(type)) {
      const { document, blocks } = value;

      if (blocks.size > 0) {
        const parent = document.getParent(blocks.first().key);
        isActive =
          hasBlock('list-item') && !!parent && (parent as any).type === type;
      }
    }

    return (
      <SlateEditorToolbarButton
        onMouseDown={event => onClickBlock(event, type)}
      >
        <Icon color={isActive ? '#000000' : '#cccccc'} size={18} />
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
        <SlateToolbarActionContainer>
          {state.status === 'fetching' && (
            <SlateToolbarActionMessage>Saving ...</SlateToolbarActionMessage>
          )}
          {state.status === 'success' && (
            <SlateToolbarActionMessage>Saved</SlateToolbarActionMessage>
          )}
          <SlateToolbarActionIcon onClick={onOpenOptions}>
            <MdSettings size={22} />
          </SlateToolbarActionIcon>
        </SlateToolbarActionContainer>
      </SlateEditorToolbar>

      <EditorStyle>
        <StyledEditor
          ref={editorRef}
          plugins={slatePlugins}
          // TODO fix types
          value={value as any}
          onChange={handleTextChange as any}
          onKeyDown={onKeyDown as any}
          schema={schema as any}
          placeholder="Text"
          renderBlock={renderBlock}
          renderMark={renderMark}
        />
      </EditorStyle>
    </React.Fragment>
  );
};
