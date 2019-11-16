import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { toast } from 'react-toastify';
import {
  Editor,
  RenderBlockProps,
  RenderInlineProps,
  RenderMarkProps,
  EditorProps,
} from 'slate-react';
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
import Link from 'next/link';
import {
  PageContainer,
  PageTitleContainer,
  PageTitle,
} from '../../home/components/Home';
import { ButtonOutline } from '../../../components';
import {
  saveStoryFile,
  convertStoryToSubsetStory,
  getStoriesFile,
  saveStoriesFile,
} from '../../../utils';
import { Story } from '../../../types';
import { Content } from '../../publicStory/components/PublicStory';
import { StorySettings } from '../containers/StorySettings';
import { config } from '../../../config';
import { hasBlock, hasLinks, wrapLink, unwrapLink, insertImage } from './utils';
import { SlateEditorSideMenu } from './SlateEditorSideMenu';
import { SlateEditorHoverMenu } from './SlateEditorHoverMenu';
import { SlateMarkButton } from './SlateMarkButton';

const StyledLinkContainer = styled.div`
  ${tw`mb-4`};
`;

const StyledLink = styled.a`
  ${tw`no-underline text-black flex cursor-pointer`};
`;

const StyledMdArrowBack = styled(MdArrowBack)`
  ${tw`mr-2`};
`;

const Input = styled.input`
  ${tw`outline-none w-full text-2xl`};
`;

const Image = styled.img<{ selected: boolean }>`
  display: block;
  max-width: 100%;
  max-height: 20em;
  box-shadow: ${(props: any) =>
    props.selected ? '0 0 0 1px #000000;' : 'none'};
`;

const SlateContainer = styled.div`
  ${tw`my-8`};
`;

const SlateToolbar = styled.div`
  ${tw`py-4 border-b border-solid border-grey flex z-10 bg-white sticky flex justify-between max-w-full overflow-auto`};
  top: 0;

  @media (min-width: ${config.breakpoints.md}px) {
    ${tw`overflow-visible`};
  }
`;

const SlateToolbarButtonContainer = styled.div`
  ${tw`flex`};
`;

const SlateToolbarButton = styled.button`
  ${tw`py-2 px-2 outline-none flex`};
`;

const SlateToolbarActionContainer = styled.div`
  ${tw`flex items-center`};
`;

const SlateToolbarActionIcon = styled.div`
  ${tw`p-2 -mr-2 flex items-center cursor-pointer text-pink`};
`;

const StyledContent = styled(Content)`
  margin: 0;
`;

const StyledEditor = styled(Editor)`
  ${tw`py-4`};
  min-height: 150px;
`;

// See https://github.com/ianstormtaylor/slate/blob/master/examples/rich-text/index.js

// TODO add links

const DEFAULT_NODE = 'paragraph';

const schema = {
  document: {
    last: { type: 'paragraph' },
    normalize: (editor: any, { code, node }: any) => {
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
            text: '',
          },
        ],
      },
    ],
  },
};

const slatePlugins = [SoftBreak({ shift: true })];

// TODO warn user if he try to leave the page with unsaved changes

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

const onClickImage = (editor: Editor) => {
  const src = window.prompt('Enter the URL of the image:');
  if (!src) return;
  editor.command(insertImage, src);
};

/**
 * Handle key press from the user and allow shortcuts.
 */
const onKeyDown = (
  event: React.KeyboardEvent,
  editor: any,
  next: () => any
) => {
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

interface Props {
  story: Story;
  onChangeTitle: (title: string) => void;
  onChangeStoryField: (field: string, value: any) => void;
}

export const SlateEditor = ({
  story,
  onChangeTitle,
  onChangeStoryField,
}: Props) => {
  const editorRef = useRef<any>(null);
  const sideMenuRef = useRef<any>(null);
  const hoverMenuRef = useRef<any>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [value, setValue] = useState(
    story.content
      ? Value.fromJSON(story.content)
      : Value.fromJSON(emptyNode as any)
  );

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
      case 'list-item':
        return <li {...attributes}>{children}</li>;
      case 'numbered-list':
        return <ol {...attributes}>{children}</ol>;
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>;
      case 'image':
        const src = node.data.get('src');
        return <Image src={src} selected={isFocused} {...attributes} />;
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
   * Render a block-toggling toolbar button.
   */
  const renderBlockButton = (type: string, Icon: any) => {
    let isActive = hasBlock(value, type);

    if (['numbered-list', 'bulleted-list'].includes(type)) {
      const editor = editorRef.current;
      if (editor) {
        const { value } = editor;
        const { document, blocks } = value;

        if (blocks.size > 0) {
          const parent = document.getParent(blocks.first().key);
          isActive =
            hasBlock(value, 'list-item') && parent && parent.type === type;
        }
      }
    }

    return (
      <SlateToolbarButton
        onMouseDown={event => {
          event.preventDefault();
          onClickBlock(editorRef.current, type);
        }}
      >
        <Icon color={isActive ? '#000000' : '#bbbaba'} size={18} />
      </SlateToolbarButton>
    );
  };

  /**
   * Render a link toolbar button.
   */
  const renderLinkButton = () => {
    const isActive = hasLinks(value);

    return (
      <SlateToolbarButton
        onMouseDown={event => {
          event.preventDefault();
          onClickLink(editorRef.current);
        }}
      >
        <MdLink color={isActive ? '#000000' : '#bbbaba'} size={18} />
      </SlateToolbarButton>
    );
  };

  /**
   * Render the editor with the side menu
   */
  const renderEditor = (props: EditorProps, editor: any, next: () => any) => {
    const children = next();
    return (
      <React.Fragment>
        <SlateToolbar>
          <SlateToolbarButtonContainer>
            <SlateMarkButton
              editor={editor}
              component="toolbar"
              type="bold"
              icon={MdFormatBold}
              iconSize={18}
            />
            <SlateMarkButton
              editor={editor}
              component="toolbar"
              type="italic"
              icon={MdFormatItalic}
              iconSize={18}
            />
            <SlateMarkButton
              editor={editor}
              component="toolbar"
              type="underlined"
              icon={MdFormatUnderlined}
              iconSize={18}
            />
          </SlateToolbarButtonContainer>
          <SlateToolbarActionContainer>
            {loadingSave && (
              <ButtonOutline style={{ marginRight: 6 }} disabled>
                Saving ...
              </ButtonOutline>
            )}
            {!loadingSave && (
              <ButtonOutline style={{ marginRight: 6 }} onClick={handleSave}>
                Save
              </ButtonOutline>
            )}
            <SlateToolbarActionIcon onClick={handleOpenSettings}>
              <MdSettings size={22} />
            </SlateToolbarActionIcon>
          </SlateToolbarActionContainer>
        </SlateToolbar>

        {children}

        <SlateEditorSideMenu
          ref={sideMenuRef}
          editor={editor}
          onClick={() => onClickImage(editor)}
        />
        <SlateEditorHoverMenu ref={hoverMenuRef} editor={editor} />
      </React.Fragment>
    );
  };

  /**
   * Update the menu's absolute position only if:
   * - it's a paragraph
   * - text is empty
   */
  const updateSideMenu = (value: Value) => {
    const sideMenu = sideMenuRef.current;
    if (!sideMenu) return;

    const { texts, blocks, focusBlock } = value;
    const topBlock = blocks.get(0);
    const isAParagraph = topBlock && topBlock.type === 'paragraph';
    const isEmptyText = texts && texts.get(0) && texts.get(0).text.length === 0;
    if (isAParagraph && isEmptyText) {
      const block = document.querySelector(`[data-key='${focusBlock.key}']`);
      if (block) {
        const size = block.getBoundingClientRect();
        sideMenu.style.top = `${size.top + window.pageYOffset}px`;
        sideMenu.style.left = `${size.left - 40}px`;
        sideMenu.style.opacity = 1;
      }
    } else {
      sideMenu.removeAttribute('style');
    }
  };

  /**
   * Update the menu's absolute position.
   */
  const updateHoverMenu = (value: Value) => {
    const hoverMenu = hoverMenuRef.current;
    if (!hoverMenu) return;

    const { fragment, selection } = value;

    if (selection.isBlurred || selection.isCollapsed || fragment.text === '') {
      hoverMenu.removeAttribute('style');
      return;
    }

    const native = window.getSelection();
    if (!native) return;
    const range = native.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    hoverMenu.style.opacity = 1;
    hoverMenu.style.top = `${rect.top +
      window.pageYOffset -
      hoverMenu.offsetHeight}px`;

    hoverMenu.style.left = `${rect.left +
      window.pageXOffset -
      hoverMenu.offsetWidth / 2 +
      rect.width / 2}px`;
  };

  const handleTextChange = ({ value }: { value: Value }) => {
    setValue(value);
    updateSideMenu(value);
    updateHoverMenu(value);
  };

  const handleSave = async () => {
    setLoadingSave(true);
    try {
      const content = value.toJSON();
      const updatedStory: Story = {
        ...story,
        content,
        updatedAt: Date.now(),
      };
      const subsetStory = convertStoryToSubsetStory(updatedStory);
      const file = await getStoriesFile();
      const index = file.stories.findIndex(s => s.id === story.id);
      if (index === -1) {
        throw new Error('File not found in list');
      }
      // First we save the story
      await saveStoryFile(updatedStory);
      // Then we need to update the subset story on the index
      file.stories[index] = subsetStory;
      // We sort the files by date in case createdAt was changed
      file.stories.sort((a, b) => b.createdAt - a.createdAt);
      await saveStoriesFile(file);
      toast.success('Story saved');
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
    setLoadingSave(false);
  };

  const handleOpenSettings = () => {
    setSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
  };

  return (
    <PageContainer>
      <StyledLinkContainer>
        <Link href="/">
          <StyledLink>
            <StyledMdArrowBack /> Back to my stories
          </StyledLink>
        </Link>
      </StyledLinkContainer>
      <PageTitleContainer>
        <PageTitle>Editor</PageTitle>
      </PageTitleContainer>

      <div>
        <Input
          value={story.title}
          onChange={(e: any) => onChangeTitle(e.target.value)}
          placeholder="Title"
        />

        <SlateContainer>
          <SlateToolbar>
            <SlateToolbarButtonContainer>
              {renderBlockButton('block-quote', MdFormatQuote)}
              {renderBlockButton('heading-one', MdLooksOne)}
              {renderBlockButton('heading-two', MdLooksTwo)}
              {renderBlockButton('heading-three', MdLooks3)}
              {renderBlockButton('numbered-list', MdFormatListNumbered)}
              {renderBlockButton('bulleted-list', MdFormatListBulleted)}
              {renderLinkButton()}
              <SlateToolbarButton
                onMouseDown={event => {
                  event.preventDefault();
                  onClickImage(editorRef.current);
                }}
              >
                <MdImage color={'#b8c2cc'} size={18} />
              </SlateToolbarButton>
            </SlateToolbarButtonContainer>
            <SlateToolbarActionContainer>
              {loadingSave && (
                <ButtonOutline style={{ marginRight: 6 }} disabled>
                  Saving ...
                </ButtonOutline>
              )}
              {!loadingSave && (
                <ButtonOutline style={{ marginRight: 6 }} onClick={handleSave}>
                  Save
                </ButtonOutline>
              )}
              <SlateToolbarActionIcon onClick={handleOpenSettings}>
                <MdSettings size={22} />
              </SlateToolbarActionIcon>
            </SlateToolbarActionContainer>
          </SlateToolbar>

          <StyledContent>
            <StyledEditor
              ref={editorRef}
              plugins={slatePlugins}
              value={value}
              onChange={handleTextChange}
              onKeyDown={onKeyDown}
              schema={schema}
              placeholder="Text"
              renderEditor={renderEditor}
              renderBlock={renderBlock}
              renderMark={renderMark}
              renderInline={renderInline}
            />
          </StyledContent>
        </SlateContainer>
        <StorySettings
          story={story}
          open={settingsOpen}
          onClose={handleCloseSettings}
          onChangeStoryField={onChangeStoryField}
        />
      </div>
    </PageContainer>
  );
};
