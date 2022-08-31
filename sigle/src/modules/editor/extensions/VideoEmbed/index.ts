import { mergeAttributes, Node, nodePasteRule } from '@tiptap/core';

import {
  getEmbedURLFromYoutubeURL,
  isValidYoutubeUrl,
  YOUTUBE_REGEX_GLOBAL,
} from './youtube';

export interface VideoEmbedOptions {
  allowFullscreen: boolean;
  controls: boolean;
  height: number;
  HTMLAttributes: Record<string, any>;
  width: number;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    videoEmbed: {
      /**
       * Insert a video embed
       */
      setVideoEmbed: (options: {
        src: string;
        width?: number;
        height?: number;
        start?: number;
      }) => ReturnType;
    };
  }
}

export const VideoEmbed = Node.create<VideoEmbedOptions>({
  name: 'video-embed',
  group: 'block',
  draggable: true,
  selectable: true,

  addOptions() {
    return {
      allowFullscreen: false,
      controls: true,
      height: 480,
      HTMLAttributes: {},
      width: 640,
    };
  },

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
        (options) =>
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
    const embedUrl = getEmbedURLFromYoutubeURL({
      url: HTMLAttributes.src,
      controls: this.options.controls,
      startAt: HTMLAttributes.start || 0,
    });

    console.log({ HTMLAttributes });

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
            allowfullscreen: this.options.allowFullscreen,
          },
          HTMLAttributes
        ),
      ],
    ];
  },
});
