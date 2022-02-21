import React, { useState, useRef } from 'react';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';
import { toast } from 'react-toastify';
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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Container,
} from '../../../ui';
import {
  saveStoryFile,
  convertStoryToSubsetStory,
  getStoriesFile,
  saveStoriesFile,
  generateRandomId,
  getStoryFile,
} from '../../../utils';
import { Story } from '../../../types';
import { Content } from '../../publicStory/components/PublicStory';
import { StorySettings } from './StorySettings';
import { SlateEditorSideMenu } from './SlateEditorSideMenu';
import { SlateEditorHoverMenu } from './SlateEditorHoverMenu';
import { SlateEditorToolbar } from './SlateEditorToolbar';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Flex,
  Heading,
  Text,
} from '../../../ui';
import {
  DEFAULT_NODE,
  hasBlock,
  insertImage,
  unwrapLink,
  hasLinks,
  wrapLink,
} from './utils';
import { storage } from '../../../utils/blockstack';
import { resizeImage } from '../../../utils/image';
import { PageContainer } from './Editor';
import { SlateEditorLink } from './SlateEditorLink';
import { TwitterCardPreview } from './TwitterCardPreview';
import { StoryPublishedDialog } from './StoryPublishedDialog';
import { EditorHeader } from '../EditorHeader';

const Input = styled.input`
  ${tw`outline-none w-full text-4xl font-bold`};
`;

const Image = styled.img<{ selected: boolean; isUploading?: boolean }>`
  ${tw`opacity-100 block transition-opacity duration-700`};
  max-width: 100%;
  max-height: 20em;
  box-shadow: ${(props: any) =>
    props.selected ? '0 0 0 1px #000000;' : 'none'};

  ${(props) =>
    props.isUploading &&
    css`
      ${tw`opacity-25`};
    `}
`;

export const SlateContainer = styled.div`
  ${tw`my-8`};
`;

export const StyledContent = styled(Content)`
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

interface Props {
  story: Story;
  onChangeTitle: (title: string) => void;
  onChangeStory: (newStory: Story) => void;
  showPublishDialog: boolean;
  publishLoading: boolean;
  onPublish: () => void;
  onCancelPublish: () => void;
  onConfirmPublish: () => Promise<void>;
  showPublishedDialog: boolean;
  onClosePublished: () => void;
  showUnpublishDialog: boolean;
  unpublishLoading: boolean;
  onUnpublish: () => void;
  onCancelUnpublish: () => void;
  onConfirmUnpublish: () => void;
}

export const SlateEditor = ({
  story,
  onChangeTitle,
  onChangeStory,
  showPublishDialog,
  publishLoading,
  onPublish,
  onCancelPublish,
  onConfirmPublish,
  showPublishedDialog,
  onClosePublished,
  showUnpublishDialog,
  unpublishLoading,
  onUnpublish,
  onCancelUnpublish,
  onConfirmUnpublish,
}: Props) => {
  const editorRef = useRef<Editor>(null);
  const sideMenuRef = useRef<any>(null);
  const hoverMenuRef = useRef<any>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [editLinkOpen, setEditLinkOpen] = useState(false);
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
        // Resize the image client side for faster upload and to save storage space
        // We skip resizing gif as it's turning them as single image
        let blob: Blob | File = file;
        if (file.type !== 'image/gif') {
          blob = await resizeImage(file, { maxWidth: 2000 });
        }

        const name = `photos/${story.id}/${id}-${file.name}`;
        const imageUrl = await storage.putFile(name, blob as any, {
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
        const src = node.data.get('src');
        const id = node.data.get('id');
        const isUploading = node.data.get('isUploading');
        return (
          <Image
            {...attributes}
            src={src}
            selected={isFocused}
            isUploading={isUploading}
            id={`image-${id}`}
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
      case 'code':
        return <code {...attributes}>{children}</code>;
      default:
        return next();
    }
  };

  /**
   * Render a Slate inline.
   */
  const renderInline = (
    props: RenderInlineProps,
    editor: Editor,
    next: () => any
  ) => {
    const { attributes, children, node } = props;

    switch (node.type) {
      /**
       * Hovering the link should render a tooltip with a clickable link inside
       */
      case 'link':
        const { data } = node;
        const href = data.get('href');

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <a {...attributes} href={href}>
                {children}

                {/* TooltipContent is rendered inside TooltipTrigger in order to be interactive */}
                <TooltipContent>
                  <a href={href} target="_blank" rel="noreferrer">
                    {href}
                  </a>
                </TooltipContent>
              </a>
            </TooltipTrigger>
          </Tooltip>
        );
      default:
        return next();
    }
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
    hoverMenu.style.top = `${
      rect.top + window.pageYOffset - hoverMenu.offsetHeight
    }px`;

    hoverMenu.style.left = `${
      rect.left +
      window.pageXOffset -
      hoverMenu.offsetWidth / 2 +
      rect.width / 2
    }px`;
  };

  const handleTextChange = ({ value }: { value: Value }) => {
    setValue(value);
    updateSideMenu(value);
    updateHoverMenu(value);
  };

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
        editor.value.texts.get(0) &&
        editor.value.texts.get(0).text.length === 0;
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

    let mark: string | undefined;
    if (event.key === 'b') {
      mark = 'bold';
    } else if (event.key === 'i') {
      mark = 'italic';
    } else if (event.key === 'u') {
      mark = 'underlined';
    } else if (event.key === 'k') {
      handleEditLink();
    } else if (event.keyCode === 192) {
      // event.keyCode 192 is '`'
      mark = 'code';
    } else {
      return next();
    }

    event.preventDefault();
    if (mark) {
      editor.toggleMark(mark);
    }
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
      const storyFile = (await getStoryFile(story.id)) as Story;
      const content = value.toJSON();
      const updatedStory: Story = {
        ...storyFile,
        ...storyParam,
        title: story.title,
        content,
        updatedAt: Date.now(),
      };
      const subsetStory = convertStoryToSubsetStory(updatedStory);
      const file = await getStoriesFile();
      const index = file.stories.findIndex((s) => s.id === story.id);
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
      // Update the root object
      onChangeStory(updatedStory);
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

  const handleEditLink = () => {
    setEditLinkOpen(true);
  };

  const handleEditPreview = () => {
    onCancelPublish();
    handleOpenSettings();
  };

  // TODO onPaste for links see https://github.com/ianstormtaylor/slate/blob/master/examples/links/index.js
  const handleConfirmEditLink = (values: { text: string; link: string }) => {
    setEditLinkOpen(false);
    const editor = editorRef.current!;
    const { value } = editor;
    const valueHaveLinks = hasLinks(value);

    if (valueHaveLinks) {
      // We first unwrap the text to avoid nested links
      unwrapLink(editor);
    }

    if (values.link) {
      editor
        .insertText(values.text)
        .moveFocusBackward(values.text.length)
        .command(wrapLink, values.link);
    }
  };

  /**
   * Render the editor with the side menu and mobile menu
   */
  const renderEditor = (props: EditorProps, editor: any, next: () => any) => {
    const children = next();

    return (
      <React.Fragment>
        <SlateEditorToolbar
          editor={editor}
          value={value}
          loadingSave={loadingSave}
          handleOpenSettings={handleOpenSettings}
          handleSave={handleSave}
          addImageToEditor={addImageToEditor}
          onEditLink={handleEditLink}
        />

        {children}

        <SlateEditorSideMenu
          ref={sideMenuRef}
          editor={editor}
          addImageToEditor={addImageToEditor}
        />
        <SlateEditorHoverMenu
          ref={hoverMenuRef}
          editor={editor}
          onEditLink={handleEditLink}
        />
      </React.Fragment>
    );
  };

  return (
    <Container
      css={{
        pt: '$5',
        '@md': {
          pt: '$10',
        },
      }}
    >
      <EditorHeader
        story={story}
        loadingSave={loadingSave}
        onOpenSettings={handleOpenSettings}
        onSave={handleSave}
        onPublish={onPublish}
        onUnpublish={onUnpublish}
      />
      <PageContainer>
        <Input
          value={story.title}
          onChange={(e) => onChangeTitle(e.target.value)}
          placeholder="Title"
        />

        <SlateContainer>
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

        {editorRef.current && (
          <SlateEditorLink
            editor={editorRef.current}
            open={editLinkOpen}
            onConfirmEditLink={handleConfirmEditLink}
            onClose={() => setEditLinkOpen(false)}
          />
        )}

        <StorySettings
          story={story}
          open={settingsOpen}
          onClose={handleCloseSettings}
          onSave={handleSave}
        />

        <Dialog open={showPublishDialog} onOpenChange={onCancelPublish}>
          <DialogContent>
            <DialogTitle asChild>
              <Heading as="h2" size="2xl" css={{ textAlign: 'center' }}>
                One last check
              </Heading>
            </DialogTitle>
            <DialogDescription asChild>
              <Text css={{ mb: '$5', textAlign: 'center' }}>
                Social media preview
              </Text>
            </DialogDescription>
            <TwitterCardPreview story={story} />
            <Flex justify="end" gap="6" css={{ mt: '$5' }}>
              <Button
                size="lg"
                variant="ghost"
                color="orange"
                disabled={loadingSave || publishLoading}
                onClick={handleEditPreview}
              >
                Edit preview
              </Button>
              <Button
                size="lg"
                color="orange"
                disabled={loadingSave || publishLoading}
                onClick={async () => {
                  // We save before publishing
                  await handleSave();
                  await onConfirmPublish();
                }}
              >
                {loadingSave || publishLoading
                  ? 'Publishing ...'
                  : 'Publish now'}
              </Button>
            </Flex>
          </DialogContent>
        </Dialog>

        <StoryPublishedDialog
          open={showPublishedDialog}
          onOpenChange={onClosePublished}
          story={story}
        />

        <Dialog open={showUnpublishDialog} onOpenChange={onCancelUnpublish}>
          <DialogContent>
            <DialogTitle asChild>
              <Heading as="h2" size="xl" css={{ mb: '$3' }}>
                Unpublish my story
              </Heading>
            </DialogTitle>
            <DialogDescription asChild>
              <Text>You’re about to unpublish this story.</Text>
              <Text>
                It won’t be visible on your blog anymore but you still can see
                and edit it in your draft section.
              </Text>
            </DialogDescription>
            <Flex justify="end" gap="6" css={{ mt: '$6' }}>
              <DialogClose asChild>
                <Button size="lg" variant="ghost" disabled={unpublishLoading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                size="lg"
                color="orange"
                disabled={unpublishLoading}
                onClick={onConfirmUnpublish}
              >
                {unpublishLoading ? 'Unpublishing ...' : 'Confirm'}
              </Button>
            </Flex>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </Container>
  );
};
