import { generateJSON } from '@tiptap/html';
import { generateText } from '@tiptap/core';
import TipTapDocument from '@tiptap/extension-document';
import TipTapParagraph from '@tiptap/extension-paragraph';
import TipTapText from '@tiptap/extension-text';

/**
 * Extract a string text from a story HTML.
 */
export const getTextFromHtml = (html: string): string => {
  const tipTapExtensions = [TipTapDocument, TipTapParagraph, TipTapText];
  const parsed = generateJSON(html, tipTapExtensions);
  return generateText(parsed, tipTapExtensions);
};
