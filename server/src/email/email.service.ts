import { Injectable } from '@nestjs/common';
import { parse } from 'himalaya';

const inlineText = (json: any[]): string => {
  let text = '';
  json.forEach((node) => {
    if (node.type === 'text') {
      text += node.content;
    } else if (
      node.tagName === 'strong' ||
      node.tagName === 'em' ||
      node.tagName === 'u' ||
      node.tagName === 's'
    ) {
      text += `<${node.tagName}>${inlineText(node.children)}</${node.tagName}>`;
    }
  });
  return text;
};

@Injectable()
export class EmailService {
  htmlToMJML(html: string): string {
    // TODO sanitise html or elsewhere ?
    let mjml = '';
    const json = parse(html);
    json.forEach((node) => {
      if (node.tagName === 'p') {
        mjml += `<mj-text>${inlineText(node.children)}</mj-text>`;
      }
    });
    console.log(JSON.stringify(json, null, 2));
    return mjml;
  }
}
