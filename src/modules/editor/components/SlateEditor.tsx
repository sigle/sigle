import React, { useState, useRef } from 'react';
import styled from 'styled-components/macro';
import tw from 'tailwind.macro';
import { toast } from 'react-toastify';
import { Editor } from 'slate-react';
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
} from 'react-icons/md';
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
import { Link } from 'react-router-dom';
import { config } from '../../../config';

const StyledLink = styled(Link)`
  ${tw`no-underline text-black mb-4`};
  display: block;
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
  ${tw`py-4 border-b border-solid border-grey-light flex z-10 bg-white sticky`};
  top: 0;
`;

const SlateToolbarButton = styled.button`
  ${tw`py-2 px-2 outline-none flex`};
`;

const StyledEditor = styled(Editor)`
  ${tw`py-4`};
`;

// See https://github.com/ianstormtaylor/slate/blob/master/examples/rich-text/index.js

// https://www.toulouse-tourisme.com/sites/www.toulouse-tourisme.com/files/styles/incontournable_hp/public/thumbnails/image/incontournables_0.jpg

// TODO add links
// TODO handle cmd+b to set the text to bold for example

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

// TODO warn user if he try to leave the page with unsaved changes

interface Props {
  width: number;
  story: Story;
  loadingDelete: boolean;
  onDelete: () => void;
}

export const SlateEditor = ({
  width,
  story,
  loadingDelete,
  onDelete,
}: Props) => {
  const editorRef = useRef<any>(null);
  const [loadingSave, setLoadingSave] = useState(false);
  const [title, setTitle] = useState(story.title);
  const [value, setValue] = useState(Value.fromJSON(story.content));

  const showEditor = width >= config.breakpoints.md;

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

  const onClickImage = (event: any) => {
    event.preventDefault();
    const src = window.prompt('Enter the URL of the image:');
    if (!src) return;
    editorRef.current.command(insertImage, src);
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

  const hasMark = (type: string) => {
    return value.activeMarks.some((mark: any) => mark.type == type);
  };

  const hasBlock = (type: string) => {
    return value.blocks.some((node: any) => node.type == type);
  };

  const renderNode = (props: any, _: any, next: any) => {
    const { attributes, children, node, isFocused } = props;

    switch (node.type) {
      case 'block-quote':
        return <blockquote {...attributes}>{children}</blockquote>;
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>;
      case 'heading-one':
        return <h1 {...attributes}>{children}</h1>;
      case 'heading-two':
        return <h2 {...attributes}>{children}</h2>;
      case 'list-item':
        return <li {...attributes}>{children}</li>;
      case 'numbered-list':
        return <ol {...attributes}>{children}</ol>;
      case 'image':
        const src = node.data.get('src');
        return <Image src={src} selected={isFocused} {...attributes} />;
      default:
        return next();
    }
  };

  const renderMark = (props: any, _: any, next: any) => {
    const { children, mark, attributes } = props;

    switch (mark.type) {
      case 'bold':
        return <strong {...attributes}>{children}</strong>;
      case 'code':
        return <code {...attributes}>{children}</code>;
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
      <SlateToolbarButton
        onMouseDown={(event: any) => onClickMark(event, type)}
      >
        <Icon color={isActive ? '#000000' : '#b8c2cc'} size={18} />
      </SlateToolbarButton>
    );
  };

  const renderBlockButton = (type: string, Icon: any) => {
    const isActive = hasBlock(type);

    return (
      <SlateToolbarButton
        onMouseDown={(event: any) => onClickBlock(event, type)}
      >
        <Icon color={isActive ? '#000000' : '#b8c2cc'} size={18} />
      </SlateToolbarButton>
    );
  };

  const handleSave = async () => {
    setLoadingSave(true);
    try {
      const content = value.toJSON();
      const updatedStory: Story = {
        ...story,
        title,
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

  return (
    <PageContainer>
      <StyledLink to="/">
        <MdArrowBack /> Back to my stories
      </StyledLink>

      <PageTitleContainer>
        <PageTitle>Editor</PageTitle>
        <div>
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
          {loadingDelete && (
            <ButtonOutline disabled>Deleting ...</ButtonOutline>
          )}
          {!loadingDelete && (
            <ButtonOutline onClick={onDelete}>Delete</ButtonOutline>
          )}
        </div>
      </PageTitleContainer>

      {!showEditor && <div>The editor is not available on mobile.</div>}

      {showEditor && (
        <div>
          <Input
            value={title}
            onChange={(e: any) => setTitle(e.target.value)}
            placeholder="Title"
          />

          <SlateContainer>
            <SlateToolbar>
              {renderMarkButton('bold', MdFormatBold)}
              {renderMarkButton('italic', MdFormatItalic)}
              {renderMarkButton('underlined', MdFormatUnderlined)}
              {renderBlockButton('block-quote', MdFormatQuote)}
              {renderBlockButton('numbered-list', MdFormatListNumbered)}
              {renderBlockButton('bulleted-list', MdFormatListBulleted)}
              <SlateToolbarButton onMouseDown={onClickImage}>
                <MdImage color={'#b8c2cc'} size={18} />
              </SlateToolbarButton>
            </SlateToolbar>

            <StyledEditor
              ref={editorRef}
              value={value}
              onChange={handleTextChange}
              schema={schema}
              placeholder="Text"
              renderNode={renderNode}
              renderMark={renderMark}
            />
          </SlateContainer>
        </div>
      )}
    </PageContainer>
  );
};
