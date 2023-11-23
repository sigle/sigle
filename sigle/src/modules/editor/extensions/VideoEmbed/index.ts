import { mergeAttributes, Node, nodePasteRule } from '@tiptap/core';

import {
  getEmbedUrlFromYoutubeUrl,
  isValidYoutubeUrl,
  YOUTUBE_REGEX_GLOBAL,
} from './youtube';

export interface VideoEmbedOptions {
  addPasteHandler: boolean;
  height: number;
  HTMLAttributes: Record<string, any>;
  nocookie: boolean;
  width: number;
  inline: boolean;
}

type SetVideoEmbedOptions = {
  src: string;
  width?: number;
  height?: number;
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    videoEmbed: {
      /**
       * Insert a video embed
       */
      setVideoEmbed: (options: SetVideoEmbedOptions) => ReturnType;
    };
  }
}

export const VideoEmbed = Node.create<VideoEmbedOptions>({
  name: 'video-embed',

  addOptions() {
    return {
      addPasteHandler: true,
      height: 480,
      HTMLAttributes: {},
      inline: false,
      nocookie: false,
      width: 640,
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? 'inline' : 'block';
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      start: {
        default: 0,
      },
      width: {
        default: this.options.width,
      },
      height: {
        default: this.options.height,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-video-embed] iframe',
      },
    ];
  },

  addCommands() {
    return {
      setVideoEmbed:
        (options: SetVideoEmbedOptions) =>
        ({ commands }) => {
          if (!isValidYoutubeUrl(options.src)) {
            return false;
          }

          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addPasteRules() {
    if (!this.options.addPasteHandler) {
      return [];
    }

    return [
      nodePasteRule({
        find: YOUTUBE_REGEX_GLOBAL,
        type: this.type,
        getAttributes: (match) => {
          return { src: match.input };
        },
      }),
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const embedUrl = getEmbedUrlFromYoutubeUrl({
      url: HTMLAttributes.src,
      nocookie: this.options.nocookie,
      startAt: HTMLAttributes.start || 0,
    });

    HTMLAttributes.src = embedUrl;

    return [
      'div',
      { 'data-video-embed': '' },
      [
        'iframe',
        mergeAttributes(
          this.options.HTMLAttributes,
          {
            width: this.options.width,
            height: this.options.height,
          },
          HTMLAttributes
        ),
      ],
    ];
  },
});
