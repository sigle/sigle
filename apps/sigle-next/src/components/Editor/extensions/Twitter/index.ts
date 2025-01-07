import { Node, nodePasteRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { EmbedComponent, globalPasteRegex, isValidUrl } from './component';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embed: {
      setEmbed: () => ReturnType;
    };
  }
}

const Embed = Node.create({
  name: 'embed',

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
      setEmbed:
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

  parseHTML() {
    return [
      {
        tag: 'div[data-embed]',
        getAttrs: (element) => {
          const url = (element as HTMLElement).getAttribute('data-embed');
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

    return ['div', { 'data-embed': HTMLAttributes.url }];
  },

  addStorage() {
    return {
      markdown: {
        parse: {
          /**
           * When parsing convert the twitter link to a tweet node. We do this so we can bypass
           * the link plugin.
           */

          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          setup(markdownit: any) {
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            function twitterTransformer(state: any) {
              for (let i = 0; i < state.tokens.length; i++) {
                // We check for all links inside a full paragraph
                // token needs to be a paragraph_open
                // token +1 needs to be a inline
                // token +2 needs to be a paragraph_close
                // Then we remove the paragraph and inlines and replace it with a html_block
                if (
                  state.tokens[i].type === 'paragraph_open' &&
                  state.tokens[i + 1] &&
                  state.tokens[i + 1].type === 'inline' &&
                  state.tokens[i + 2] &&
                  state.tokens[i + 2].type === 'paragraph_close'
                ) {
                  const inlineTokens = state.tokens[i + 1].children;
                  if (
                    inlineTokens.length === 3 &&
                    inlineTokens[0].type === 'link_open' &&
                    inlineTokens[1].type === 'text' &&
                    inlineTokens[2].type === 'link_close' &&
                    isValidUrl(inlineTokens[1].content)
                  ) {
                    const url = inlineTokens[0].attrGet('href');
                    const token = new state.Token('html_block', '', 0);
                    token.content = `<div data-embed="${url}"></div>`;
                    // remove the paragraph and inlines and replace it with a html_block
                    state.tokens.splice(i, 3, token);
                  }
                }
              }
            }

            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            const parser = (md: any) => {
              md.core.ruler.push('twitter_transformer', twitterTransformer);
            };

            markdownit.use(parser);
            return markdownit;
          },
        },

        /**
         * When we serialize the node, we want to add a simple link representing the tweet.
         * We serialize it as a link so it can be rendered as a link in other clients.
         */

        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        serialize(state: any, node: any) {
          // If url is not defined, we don't want to serialize the node
          if (!node.attrs.url) return;

          state.write(`[${node.attrs.url}](${node.attrs.url})`);
          state.closeBlock(node);
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedComponent);
  },
});

export { Embed as TipTapEmbed };
