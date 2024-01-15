import { Node, nodePasteRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TwitterComponent } from './component';
import { TWITTER_REGEX_GLOBAL } from './utils';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    twitter: {
      setTweet: () => ReturnType;
    };
  }
}

const Twitter = Node.create({
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
      url: {
        default: null,
      },
      pasted: false,
    };
  },

  addCommands() {
    return {
      setTweet:
        () =>
        ({ commands }) => {
          commands.insertContent({
            type: this.name,
          });
          return true;
        },
    };
  },

  addPasteRules() {
    if (!this.options.addPasteHandler) {
      return [];
    }

    return [
      nodePasteRule({
        find: TWITTER_REGEX_GLOBAL,
        type: this.type,
        getAttributes: (match) => {
          return {
            url: match.input,
            pasted: true,
          };
        },
      }),
    ];
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-twitter]',
        getAttrs: (element) => {
          const url = (element as HTMLElement).getAttribute('data-twitter');
          return { url };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    if (!HTMLAttributes.url) {
      // temporary solution as we cannot currently return null
      return ['span'];
    }

    return ['div', { 'data-twitter': HTMLAttributes.url }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TwitterComponent);
  },
});

export { Twitter as TipTapTwitter };
