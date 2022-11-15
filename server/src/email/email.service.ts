import { Injectable } from '@nestjs/common';
import { parse } from 'himalaya';

// TODO integrate https://www.npmjs.com/package/mjml-bullet-list for lists

const inlineAttributes = (
  attributes: { key: string; value: string }[],
): string =>
  attributes
    .map((attribute) => `${attribute.key}="${attribute.value}"`)
    .join(' ');

const inlineText = (json: any[]): string => {
  let text = '';
  json.forEach((node) => {
    if (node.type === 'text') {
      text += node.content;
    } else if (node.tagName === 'a') {
      text += `<${node.tagName} ${inlineAttributes(
        node.attributes,
      )}>${inlineText(node.children)}</${node.tagName}>`;
    } else if (
      node.tagName === 'strong' ||
      node.tagName === 'em' ||
      node.tagName === 'u' ||
      node.tagName === 's' ||
      node.tagName === 'code'
    ) {
      text += `<${node.tagName}>${inlineText(node.children)}</${node.tagName}>`;
    }
  });
  return text;
};

@Injectable()
export class EmailService {
  /**
   * Convert an article HTML content to the corresponding mjml template.
   */
  htmlToMJML(html: string): string {
    // TODO sanitise html or elsewhere ?
    let mjml = '';
    const json = parse(html);
    json.forEach((node) => {
      if (node.tagName === 'h2') {
        mjml += `<mj-text><h2>${inlineText(node.children)}</h2></mj-text>`;
      } else if (node.tagName === 'h3') {
        mjml += `<mj-text><h3>${inlineText(node.children)}</h3></mj-text>`;
      } else if (node.tagName === 'p') {
        mjml += `<mj-text>${inlineText(node.children)}</mj-text>`;
      } else if (node.tagName === 'blockquote') {
        mjml += `<mj-text><blockquote>${inlineText(
          node.children,
        )}</blockquote></mj-text>`;
      } else if (node.tagName === 'img') {
        mjml += `<mj-image ${inlineAttributes(node.attributes)} />`;
      } else if (node.tagName === 'hr') {
        mjml += `<mj-divider />`;
      }
    });
    return mjml;
  }
}
