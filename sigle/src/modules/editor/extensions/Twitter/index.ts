import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TwitterComponent } from './TwitterComponent';

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

  addAttributes() {
    return {
      ['data-twitter-id']: {
        default: null,
      },
    };
  },

  addCommands() {
    return {
      setTweet:
        (options) =>
        ({ commands }) => {
          //   if (!isValidYoutubeUrl(options.url)) {
          //     return false;
          //   }

          console.log({ options });
          const tweetId = options.url.split('/')[5];

          return commands.insertContent({
            type: this.name,
            attrs: {
              ['data-twitter-id']: tweetId,
            },
          });
        },
    };
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
    return ['div', mergeAttributes({ 'data-twitter': '' }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TwitterComponent);
  },

  //   addNodeView() {
  //     return ({ editor, node }) => {
  //       const div = document.createElement('div');
  //       div.className =
  //         'aspect-w-16 aspect-h-9' + (editor.isEditable ? ' cursor-pointer' : '');
  //       const iframe = document.createElement('iframe');
  //       if (editor.isEditable) {
  //         iframe.className = 'pointer-events-none';
  //       }
  //       iframe.width = '640';
  //       iframe.height = '360';
  //       iframe.frameborder = '0';
  //       iframe.allowfullscreen = '';
  //       iframe.src = node.attrs.src;
  //       div.append(iframe);
  //       return {
  //         dom: div,
  //       };
  //     };
  //   },
});
