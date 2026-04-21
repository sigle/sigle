import { type JSONContent, Node, nodePasteRule } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { EmbedComponent, globalPasteRegex, isValidUrl } from "./component";
import { TWITTER_REGEX } from "./twitter";
import { YOUTUBE_REGEX } from "./video";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    embed: {
      setEmbed: (type: "twitter" | "video") => ReturnType;
    };
  }
}

const EMBED_URL_REGEX = /^(https?:\/\/[^\s]+)\s*$/;

function getEmbedType(url: string): "twitter" | "video" {
  if (TWITTER_REGEX.test(url)) return "twitter";
  if (YOUTUBE_REGEX.test(url)) return "video";
  return "twitter";
}

const Embed = Node.create({
  name: "embed",

  group: "block",

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
      embedType: {
        default: "twitter",
      },
    };
  },

  addCommands() {
    return {
      setEmbed:
        (type: "twitter" | "video") =>
        ({ commands }) => {
          commands.insertContent({
            type: this.name,
            attrs: {
              embedType: type,
            },
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
        find: globalPasteRegex,
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

  renderHTML() {
    return ["span"];
  },

  parseHTML() {
    return [
      {
        tag: "div[data-embed]",
        getAttrs: (element) => {
          const url = (element as HTMLElement).getAttribute("data-embed");
          const embedType =
            (element as HTMLElement).getAttribute("data-embed-type") ||
            "twitter";
          return { url, embedType };
        },
      },
    ];
  },

  markdownTokenizer: {
    name: "embed",
    level: "block",

    start(src: string) {
      return src.indexOf("http");
    },

    tokenize(src: string) {
      const match = EMBED_URL_REGEX.exec(src);

      if (!match) {
        return undefined;
      }

      const url = match[1].trim();

      if (!isValidUrl(url)) {
        return undefined;
      }

      return {
        type: "embed",
        raw: match[0],
        url,
        embedType: getEmbedType(url),
      };
    },
  },

  parseMarkdown(token): JSONContent {
    return {
      type: "embed",
      attrs: {
        url: token.url,
        embedType: token.embedType ?? "twitter",
      },
    };
  },

  renderMarkdown(node) {
    if (!node.attrs?.url) return "";
    return `${node.attrs.url}\n\n`;
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedComponent);
  },
});

export { Embed as TipTapEmbed };
