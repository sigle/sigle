import 'highlight.js/styles/night-owl.css';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  useEditor,
  EditorContent,
  ReactNodeViewRenderer,
  Editor,
} from '@tiptap/react';
import TipTapBlockquote from '@tiptap/extension-blockquote';
import TipTapBold from '@tiptap/extension-bold';
import TipTapBulletList from '@tiptap/extension-bullet-list';
import TipTapCode from '@tiptap/extension-code';
import TipTapDocument from '@tiptap/extension-document';
import TipTapDropcursor from '@tiptap/extension-dropcursor';
import TipTapHardBreak from '@tiptap/extension-hard-break';
import TipTapHeading from '@tiptap/extension-heading';
import TipTapHistory from '@tiptap/extension-history';
import TipTapHorizontalRule from '@tiptap/extension-horizontal-rule';
import TipTapItalic from '@tiptap/extension-italic';
import TipTapImage from '@tiptap/extension-image';
import TipTapLink from '@tiptap/extension-link';
import TipTapListItem from '@tiptap/extension-list-item';
import TipTapOrderedList from '@tiptap/extension-ordered-list';
import TipTapParagraph from '@tiptap/extension-paragraph';
import TipTapPlaceholder from '@tiptap/extension-placeholder';
import TipTapStrike from '@tiptap/extension-strike';
import TipTapText from '@tiptap/extension-text';
import TipTapUnderline from '@tiptap/extension-underline';
import TipTapCodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight/lib/common.js';
import { SlashCommands } from './extensions/SlashCommands';
import { BubbleMenu } from './BubbleMenu';
import { slashCommands, SlashCommandsList } from './InlineMenu';
import { FloatingMenu } from './FloatingMenu';
import { styled, globalCss, keyframes, darkTheme } from '../../stitches.config';
import { CodeBlockComponent } from './extensions/CodeBlock';
import { Story } from '../../types';
import CharacterCount from '@tiptap/extension-character-count';
import { Box, Container, Flex, IconButton, Typography } from '../../ui';
import { ShortcutsDialog } from './EditorShortcuts/ShortcutsDialog';
import { clarity } from './utils/clarity-syntax';
import { KeyboardIcon } from '@radix-ui/react-icons';
import { BubbleMenuItems } from './BubbleMenuItems';
import { MobileFloatingMenu } from './MobileFloatingMenu';

const ToolbarContainer = styled(Container, {
  display: 'flex',
  alignItems: 'center',
  gap: '$5',
  position: 'fixed',
  bottom: 0,
  right: 0,
  left: 0,
  zIndex: 0,
  justifyContent: 'start',
  overflow: 'scroll',
  borderTop: '1px solid $colors$gray6',
  p: '$3',

  '@supports (-webkit-touch-callout: none) and (not (translate: none))': {
    '& button': {
      mr: '$5',
    },
  },

  '@xl': {
    justifyContent: 'end',
    gap: '$3',
    borderTop: 'none',
    transform: `none`,
    transition: 'none',
  },
});

const fadeInAnimation = keyframes({
  '0%': { opacity: '0' },
  '100%': { opacity: '1' },
});

const StyledEditorContent = styled(EditorContent, {
  '& .ProseMirror': {
    minHeight: 150,
  },
  '& .ProseMirror-focused': {
    outline: 'none',
  },
  // Placeholder plugin style
  '& .ProseMirror p.is-empty::before': {
    content: 'attr(data-placeholder)',
    float: 'left',
    color: '$gray8',
    pointerEvents: 'none',
    height: 0,
    animation: `${fadeInAnimation} 75ms cubic-bezier(0, 0, 0.2, 1)`,
  },

  // Image selected style
  '& img.ProseMirror-selectednode': {
    outline: '1px solid $orange11',
  },
  // Image uploading style
  '& img[data-loading="true"]': {
    opacity: 0.25,
  },
});

// Tippyjs theme used by the slash command menu
const globalStylesCustomEditor = globalCss({
  ".tippy-box[data-theme~='sigle-editor'] .tippy-content": {
    overflow: 'hidden',
    padding: 0,
    backgroundColor: '$gray1',
    boxShadow:
      '0px 8px 20px rgba(8, 8, 8, 0.09), 0px 10px 18px rgba(8, 8, 8, 0.06), 0px 5px 14px rgba(8, 8, 8, 0.05), 0px 3px 8px rgba(8, 8, 8, 0.05), 0px 1px 5px rgba(8, 8, 8, 0.04), 0px 1px 2px rgba(8, 8, 8, 0.03), 0px 0.2px 1px rgba(8, 8, 8, 0.02)',
    br: '$1',
    minWidth: '280px',

    [`.${darkTheme} &`]: {
      boxShadow:
        '0px 8px 20px rgba(8, 8, 8, 0.3), 0px 10px 18px rgba(8, 8, 8, 0.28), 0px 5px 14px rgba(8, 8, 8, 0.24), 0px 3px 8px rgba(8, 8, 8, 0.2), 0px 1px 5px rgba(8, 8, 8, 0.18), 0px 1px 2px rgba(8, 8, 8, 0.16), 0px 0.2px 1px rgba(8, 8, 8, 0.08)',
    },
  },
});

interface TipTapEditorProps {
  story: Story;
  editable?: boolean;
}

lowlight.registerLanguage('clarity (beta)', clarity);

export const TipTapEditor = forwardRef<
  {
    getEditor: () => Editor | null;
  },
  TipTapEditorProps
>(({ story, editable = true }, ref) => {
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const [toolbarPos, setToolbarPos] = useState(0);
  const [softKeyboardIsOpen, setSoftKeyboardIsOpen] = useState(false);
  const scrollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [width, setWidth] = useState(window.innerWidth);
  // TODO is story really needed? Could it be just the content prop?
  globalStylesCustomEditor();

  const handleCancelShortcuts = () => {
    setShowShortcutsDialog(false);
  };

  const editor = useEditor({
    editable,
    extensions: [
      CharacterCount,
      // Nodes
      TipTapDocument,
      TipTapParagraph,
      TipTapText,
      TipTapBlockquote.extend({ content: 'paragraph+' }),
      TipTapLink.configure({
        openOnClick: false,
      }),
      TipTapListItem,
      TipTapBulletList,
      TipTapOrderedList,
      TipTapHardBreak,
      TipTapHeading.configure({
        // Only allow h2 and h3
        levels: [2, 3],
      }),
      TipTapHorizontalRule,
      TipTapCodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent);
        },
      }).configure({
        lowlight,
      }),
      TipTapImage.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            loading: {
              default: false,
              renderHTML: (attributes) => {
                if (attributes.loading) {
                  return {
                    'data-loading': attributes.loading,
                  };
                }
              },
            },
            id: {
              default: false,
              renderHTML: () => ({}),
            },
          };
        },
      }),
      // Marks
      TipTapBold,
      TipTapCode,
      TipTapItalic,
      TipTapStrike,
      TipTapUnderline,
      // Extensions
      TipTapDropcursor,
      TipTapHistory,
      TipTapPlaceholder.configure({
        placeholder: ({ editor }) => {
          const currentPos = editor.state.selection.$anchor.pos;
          return currentPos === 1
            ? 'Start your story here...'
            : "Type '/' for commands";
        },
      }),
      // Custom extensions
      SlashCommands.configure({
        commands: slashCommands({ storyId: story.id }),
        component: SlashCommandsList,
      }),
    ],
    content: story.contentVersion === '2' ? story.content : '',
  });

  // Here we extend the received ref so the parent can get the editor content at any time
  useImperativeHandle(
    ref,
    () => ({
      // TODO cleanup empty <p>, <h1> etc tags, basically all empty tags
      getEditor: () => editor,
    }),
    [editor]
  );

  const isMobile = width < 1024;

  useEffect(() => {
    window.addEventListener('resize', () => setWidth(window.innerWidth));
    return () => {
      window.removeEventListener('resize', () => setWidth(window.innerWidth));
    };
  }, []);

  useEffect(() => {
    window.visualViewport.addEventListener('resize', () => {
      // detects if virtual keyboard has opened, however an imperfect solution but the best option for iOS browsers currently as it does not yet support Virtual Keyboard API
      setSoftKeyboardIsOpen(!softKeyboardIsOpen);
      handleViewport();
    });
    window.visualViewport.addEventListener('scroll', handleViewport);

    return () => {
      window.visualViewport.removeEventListener('resize', handleViewport);
      window.visualViewport.removeEventListener('scroll', handleViewport);
    };
  }, []);

  const handleViewport = () => {
    if (pendingUpdate) {
      return;
    }

    if (scrollRef) {
      window.clearTimeout(scrollRef.current as ReturnType<typeof setTimeout>);

      // debounce update to toolbar position on scroll
      scrollRef.current = setTimeout(() => {
        setPendingUpdate(true);

        requestAnimationFrame(() => {
          setPendingUpdate(false);

          const topOffset = window.visualViewport.offsetTop;

          if (topOffset >= 0) {
            setToolbarPos(
              Math.max(
                0,
                window.innerHeight -
                  window.visualViewport.height -
                  window.visualViewport.offsetTop
              )
            );
          }
        });
      }, 150);
    }
  };

  return (
    <>
      {editor && <BubbleMenu editor={editor} />}
      {editor && <FloatingMenu editor={editor} storyId={story.id} />}

      <StyledEditorContent editor={editor} />

      <ToolbarContainer
        css={{
          backgroundColor: isMobile ? '$gray1' : 'transparent',
          transform: `translateY(-${toolbarPos}px)`,
          transition: 'transform .25s',
        }}
      >
        {editable && (
          <>
            {isMobile && (
              <>
                <MobileFloatingMenu
                  editor={editor}
                  story={story}
                  triggerDisabled={!softKeyboardIsOpen}
                />
                {editor && (
                  <Flex
                    css={{
                      '@supports (-webkit-touch-callout: none) and (not (translate: none))':
                        {
                          '& button': {
                            mr: '$5',
                          },
                          mr: '$5',
                        },
                      display: '-webkit-flex',

                      '@xl': { display: 'none' },
                    }}
                    gap="5"
                  >
                    <BubbleMenuItems iconSize={15} editor={editor} />
                    <Box
                      css={{
                        width: 2,
                        backgroundColor: '$gray6',
                      }}
                    />
                    {slashCommands({ storyId: story.id })
                      .filter((item) => item.title === 'Image')
                      .map(({ icon: Icon, command }) => (
                        <IconButton
                          css={{
                            p: 0,

                            '& svg': {
                              filter: 'invert(1)',
                            },
                          }}
                          onClick={() => command({ editor: editor })}
                        >
                          <Icon width={20} height={20} />
                        </IconButton>
                      ))}
                    <Box
                      css={{
                        width: 2,
                        backgroundColor: '$gray6',
                      }}
                    />
                  </Flex>
                )}
              </>
            )}
            <Typography css={{ m: 0, whiteSpace: 'nowrap' }} size="subheading">
              {editor?.storage.characterCount.words()} words
            </Typography>
            <IconButton
              css={{
                display: 'none',

                '@xl': {
                  display: 'block',
                },
              }}
              onClick={() => setShowShortcutsDialog(true)}
              aria-label="Open keyboard shortcuts and hints"
            >
              <KeyboardIcon />
            </IconButton>
          </>
        )}
        <ShortcutsDialog
          open={showShortcutsDialog}
          onOpenChange={handleCancelShortcuts}
        />
      </ToolbarContainer>
    </>
  );
});
