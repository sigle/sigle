import React, { useState, useRef } from 'react';
import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';
import { toast } from 'react-toastify';
import Tippy from '@tippy.js/react';
import {
  Editor,
  RenderBlockProps,
  RenderInlineProps,
  RenderMarkProps,
  EditorProps,
  getEventTransfer,
} from 'slate-react';
import SoftBreak from 'slate-soft-break';
import { Block, Value } from 'slate';
import { MdSettings } from 'react-icons/md';
import {
  saveStoryFile,
  convertStoryToSubsetStory,
  getStoriesFile,
  saveStoriesFile,
  generateRandomId,
} from '../../../utils';
import { Story } from '../../../types';
import { Content } from '../../publicStory/components/PublicStory';
import { StorySettings } from '../containers/StorySettings';
import { SlateEditorSideMenu } from './SlateEditorSideMenu';
import { SlateEditorHoverMenu } from './SlateEditorHoverMenu';
import { SlateEditorToolbar } from './SlateEditorToolbar';
import { AppBar, AppBarRightContainer } from '../../layout';
import {
  ButtonOutline,
  Container,
  FullScreenDialog,
} from '../../../components';
import { DEFAULT_NODE, hasBlock, insertImage } from './utils';
import { userSession } from '../../../utils/blockstack';
import { resizeImage } from '../../../utils/image';
import { SlateEditorImage } from './SlateEditorImage';

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
const handleKeyDown = (
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
  showPublishDialog: boolean;
  publishLoading: boolean;
  onPublish: () => void;
  onCancelPublish: () => void;
  onConfirmPublish: () => void;
  showUnpublishDialog: boolean;
  unpublishLoading: boolean;
  onUnpublish: () => void;
  onCancelUnpublish: () => void;
  onConfirmUnpublish: () => void;
}

export const SlateEditor = ({
  story,
  onChangeTitle,
  onChangeStoryField,
  showPublishDialog,
  publishLoading,
  onPublish,
  onCancelPublish,
  onConfirmPublish,
  showUnpublishDialog,
  unpublishLoading,
  onUnpublish,
  onCancelUnpublish,
  onConfirmUnpublish,
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

  const addImageToEditor = (editor: Editor, files: File[], target?: any) => {
    for (const file of files) {
      const reader = new FileReader();
      const [mime] = file.type.split('/');
      if (mime !== 'image') continue;

      // First show the image as uploading since this can take a while...
      const preview = URL.createObjectURL(file);
      const id = generateRandomId();
      editor.command(
        insertImage,
        { src: preview, id, isUploading: true },
        target
      );

      reader.addEventListener('load', async () => {
        // resize the image for faster upload
        const blob = await resizeImage(file, { maxWidth: 2000 });

        const name = `photos/${story.id}/${id}-${file.name}`;
        const imageUrl = await userSession.putFile(name, blob as any, {
          // TODO encrypt if it's a draft or show a message to the user explaining the limitation
          encrypt: false,
          contentType: file.type,
        });
        const htmlNode = document.getElementById(`image-${id}`);
        if (!htmlNode) {
          // TODO handle error
          return;
        }
        const slateNode = editor.findNode(htmlNode);
        if (!slateNode) {
          // TODO handle error
          return;
        }

        editor.setNodeByKey(slateNode.key, {
          type: 'image',
          data: { src: imageUrl, id },
        });
      });

      reader.readAsDataURL(file);
    }
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
      case 'list-item':
        return <li {...attributes}>{children}</li>;
      case 'numbered-list':
        return <ol {...attributes}>{children}</ol>;
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>;
      case 'image':
        return (
          <SlateEditorImage
            node={node}
            attributes={attributes}
            isFocused={isFocused}
          />
        );
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

        <SlateEditorSideMenu
          ref={sideMenuRef}
          editor={editor}
          addImageToEditor={addImageToEditor}
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

  const handleDrop = (
    event: React.DragEvent<Element>,
    editor: Editor,
    next: () => any
  ) => {
    const target = editor.findEventRange(event);
    if (!target && event.type === 'drop') return next();

    const transfer: any = getEventTransfer(event);
    const { type, files } = transfer;

    if (type === 'files') {
      addImageToEditor(editor, files);
      return;
    }

    next();
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
                  style={{ marginRight: 12 }}
                  onClick={() => handleSave()}
                >
                  Save
                </ButtonOutline>
              </Tippy>
            )}
            {story.type === 'private' && (
              <ButtonOutline style={{ marginRight: 6 }} onClick={onPublish}>
                Publish
              </ButtonOutline>
            )}
            {story.type === 'public' && (
              <ButtonOutline style={{ marginRight: 6 }} onClick={onUnpublish}>
                Unpublish
              </ButtonOutline>
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
            addImageToEditor={addImageToEditor}
          />

          <StyledContent>
            <StyledEditor
              ref={editorRef}
              plugins={slatePlugins}
              value={value}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onDrop={handleDrop}
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

        <FullScreenDialog
          isOpen={showPublishDialog}
          confirmLoading={publishLoading}
          onConfirm={onConfirmPublish}
          onCancel={onCancelPublish}
          loadingTitle="Publishing ..."
          title="Publish my story"
          description={
            <React.Fragment>
              <p>You’re about to publish your story.</p>
              <p>You and everybody will be able to read it on your blog.</p>
              <p>Would you like to continue?</p>
            </React.Fragment>
          }
        />
        <FullScreenDialog
          isOpen={showUnpublishDialog}
          confirmLoading={unpublishLoading}
          onConfirm={onConfirmUnpublish}
          onCancel={onCancelUnpublish}
          loadingTitle="Unpublishing ..."
          title="Unpublish my story"
          description={
            <React.Fragment>
              <p>You’re about to unpublish this story.</p>
              <p>
                It won’t be visible on your blog anymore but you still can see
                and edit it in your draft section.
              </p>
            </React.Fragment>
          }
        />
      </PageContainer>
    </React.Fragment>
  );
};
