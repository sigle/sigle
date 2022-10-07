import { Node, mergeAttributes, nodePasteRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TwitterComponent } from './TwitterComponent';
import { TWITTER_REGEX_GLOBAL } from './utils';

// TODO handle global paste

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    twitter: {
      /**
       * Insert a video embed
       */
      setTweet: (options: { url: string }) => ReturnType;
    };
  }
}

export const Twitter = Node.create({
  name: 'twitter',
  group: 'block',
  selectable: true,
  draggable: true,

  addOptions() {
    return {
      addPasteHandler: true,
    };
  },

  addAttributes() {
    return {
      ['data-twitter-id']: {
        default: null,
        // force correct id
        parseHTML: (element) => element.getAttribute('data-twitter-id'),
      },
      url: {
        default: null,
      },
    };
  },

  addCommands() {
    return {
      setTweet:
        (options) =>
        ({ commands }) => {
          console.log({ options });

          return commands.insertContent({
            type: this.name,
            attrs: {
              ['data-twitter-id']: options.url,
            },
          });
        },
    };
  },

  addPasteRules() {
    if (!this.options.addPasteHandler) {
      return [];
    }

    const getTweetId = (input: string | undefined) =>
      input?.split('/')[5].split('?')[0];

    return [
      nodePasteRule({
        find: TWITTER_REGEX_GLOBAL,
        type: this.type,
        getAttributes: (match) => {
          return {
            ['data-twitter-id']: getTweetId(match.input),
            url: match.input,
          };
        },
      }),
    ];
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-twitter]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    console.log({ HTMLAttributes });

    if (HTMLAttributes.url) {
      return ['div', mergeAttributes({ 'data-twitter': '' }, HTMLAttributes)];
    } else {
      return ['span'];
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(TwitterComponent);
  },
});
