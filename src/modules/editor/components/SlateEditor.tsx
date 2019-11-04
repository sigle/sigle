import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { toast } from 'react-toastify';
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
import { hasMark, hasBlock, hasLinks } from './utils';

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

const Image = styled.img`
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [value, setValue] = useState(
    story.content
      ? Value.fromJSON(story.content)
      : Value.fromJSON(emptyNode as any)
  );

  const handleTextChange = ({ value }: any) => {
    setValue(value);
  };

  const insertImage = (editor: any, src: string, target: any) => {
    if (target) {
      editor.select(target);
    }

    editor.insertBlock({
      type: 'image',
      data: { src },
    });
  };

  const wrapLink = (editor: any, href: string) => {
    editor.wrapInline({
      type: 'link',
      data: { href },
    });

    editor.moveToEnd();
  };

  const unwrapLink = (editor: any) => {
    editor.unwrapInline('link');
  };

  const onClickImage = (event: any) => {
    event.preventDefault();
    const src = window.prompt('Enter the URL of the image:');
    if (!src) return;
    editorRef.current.command(insertImage, src);
  };

  const onClickLink = (event: any) => {
    event.preventDefault();

    const editor = editorRef.current;
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

  const onKeyDown = (event: any, editor: any, next: any) => {
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

  const renderBlock = (props: any, _: any, next: any) => {
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
    const isActive = hasMark(value, type);

    return (
      <SlateToolbarButton
        onMouseDown={(event: any) => onClickMark(event, type)}
      >
        <Icon color={isActive ? '#000000' : '#bbbaba'} size={18} />
      </SlateToolbarButton>
    );
  };

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
        onMouseDown={(event: any) => onClickBlock(event, type)}
      >
        <Icon color={isActive ? '#000000' : '#bbbaba'} size={18} />
      </SlateToolbarButton>
    );
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
      await saveStoryFile(updatedStory);
      file.stories[index] = subsetStory;
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
              {renderMarkButton('bold', MdFormatBold)}
              {renderMarkButton('italic', MdFormatItalic)}
              {renderMarkButton('underlined', MdFormatUnderlined)}
              {renderBlockButton('block-quote', MdFormatQuote)}
              {renderBlockButton('heading-one', MdLooksOne)}
              {renderBlockButton('heading-two', MdLooksTwo)}
              {renderBlockButton('heading-three', MdLooks3)}
              {renderBlockButton('numbered-list', MdFormatListNumbered)}
              {renderBlockButton('bulleted-list', MdFormatListBulleted)}
              <SlateToolbarButton onMouseDown={onClickLink}>
                <MdLink color={'#b8c2cc'} size={18} />
              </SlateToolbarButton>
              <SlateToolbarButton onMouseDown={onClickImage}>
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
              renderBlock={renderBlock}
              renderMark={renderMark}
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
