import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { toast } from 'react-toastify';
import Tippy from '@tippy.js/react';
import {
  Editor,
  RenderBlockProps,
  RenderInlineProps,
  RenderMarkProps,
  EditorProps,
} from 'slate-react';
import SoftBreak from 'slate-soft-break';
import { Block, Value } from 'slate';
import { MdSettings } from 'react-icons/md';
import {
  saveStoryFile,
  convertStoryToSubsetStory,
  getStoriesFile,
  saveStoriesFile,
} from '../../../utils';
import { Story } from '../../../types';
import { Content } from '../../publicStory/components/PublicStory';
import { StorySettings } from '../containers/StorySettings';
import { SlateEditorSideMenu } from './SlateEditorSideMenu';
import { SlateEditorHoverMenu } from './SlateEditorHoverMenu';
import { SlateEditorToolbar } from './SlateEditorToolbar';
import { AppBar, AppBarRightContainer } from '../../layout';
import { ButtonOutline, Container } from '../../../components';
import { DEFAULT_NODE, hasBlock } from './utils';

const FixedContainer = styled.div`
  ${tw`fixed w-full bg-white top-0`};
`;

const StyledAppBarRightContainer = styled(AppBarRightContainer)`
  ${tw`hidden md:flex`};
`;

const AppBarSettings = styled.div`
  ${tw`p-2 -mr-2 flex items-center cursor-pointer text-pink`};
`;

const PageContainer = styled(Container)`
  ${tw`mt-24`};
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

const StyledContent = styled(Content)`
  margin: 0;
`;

const StyledEditor = styled(Editor)`
  ${tw`py-4`};
  min-height: 150px;
`;

// See https://github.com/ianstormtaylor/slate/blob/master/examples/rich-text/index.js

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

/**
 * Handle key press from the user and allow shortcuts.
 */
const onKeyDown = (
  event: React.KeyboardEvent,
  editor: Editor,
  next: () => any
) => {
  // When the user press enter on a title or quote we reset the style to paragraph
  if (
    event.key === 'Enter' &&
    (hasBlock(editor.value, 'heading-one') ||
      hasBlock(editor.value, 'heading-two') ||
      hasBlock(editor.value, 'heading-three') ||
      hasBlock(editor.value, 'block-quote'))
  ) {
    event.preventDefault();
    editor.splitBlock().setBlocks(DEFAULT_NODE);
    return;
  }

  // When the user press enter or backspace on a empty list item
  // we should remove the list block and set it to paragraph
  if (
    ['Enter', 'Backspace'].includes(event.key) &&
    editor.value.blocks.size > 0
  ) {
    const parent = editor.value.document.getParent(
      editor.value.blocks.first().key
    );
    const isEmptyText =
      editor.value.texts.get(0) && editor.value.texts.get(0).text.length === 0;
    if (
      parent &&
      ['numbered-list', 'bulleted-list'].includes((parent as any).type) &&
      isEmptyText
    ) {
      event.preventDefault();
      editor
        .setBlocks(DEFAULT_NODE)
        .unwrapBlock('bulleted-list')
        .unwrapBlock('numbered-list');
      return;
    }
  }

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
   * Render the editor with the side menu
   */
  const renderEditor = (props: EditorProps, editor: any, next: () => any) => {
    const children = next();

    return (
      <React.Fragment>
        {children}

        <SlateEditorSideMenu ref={sideMenuRef} editor={editor} />
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

  const handleSave = async (storyParam?: Partial<Story>) => {
    setLoadingSave(true);
    try {
      const content = value.toJSON();
      const updatedStory: Story = {
        ...story,
        ...storyParam,
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
    <React.Fragment>
      <FixedContainer>
        <AppBar>
          <StyledAppBarRightContainer>
            {loadingSave && (
              <ButtonOutline style={{ marginRight: 6 }} disabled>
                Saving ...
              </ButtonOutline>
            )}
            {!loadingSave && story.type === 'public' && (
              <ButtonOutline
                style={{ marginRight: 6 }}
                onClick={() => handleSave()}
              >
                Save
              </ButtonOutline>
            )}
            {!loadingSave && story.type === 'private' && (
              <Tippy
                content="Nobody can see it unless you click on « publish »"
                theme="light-border"
              >
                <ButtonOutline
                  style={{ marginRight: 6 }}
                  onClick={() => handleSave()}
                >
                  Save
                </ButtonOutline>
              </Tippy>
            )}
            <AppBarSettings onClick={handleOpenSettings}>
              <MdSettings size={22} />
            </AppBarSettings>
          </StyledAppBarRightContainer>
        </AppBar>
      </FixedContainer>

      <PageContainer>
        <Input
          value={story.title}
          onChange={e => onChangeTitle(e.target.value)}
          placeholder="Title"
        />

        <SlateContainer>
          <SlateEditorToolbar
            editor={editorRef.current}
            value={value}
            loadingSave={loadingSave}
            handleOpenSettings={handleOpenSettings}
            handleSave={handleSave}
          />

          <StyledContent>
            <StyledEditor
              ref={editorRef}
              plugins={slatePlugins}
              value={value}
              onChange={handleTextChange}
              onKeyDown={onKeyDown as any}
              schema={schema}
              placeholder="Start your story here..."
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
          onSave={handleSave}
        />
      </PageContainer>
    </React.Fragment>
  );
};
