import { readFileSync } from 'fs';
import { Injectable } from '@nestjs/common';
import { parse } from 'himalaya';
import { compile } from 'handlebars';
import { SettingsFile, Story } from '../external/gaia';

const inlineAttributes = (
  attributes: { key: string; value: string }[],
  transform: { [key: string]: (value: string) => string } = {},
): string =>
  attributes
    .map(
      (attribute) =>
        `${attribute.key}="${
          transform[attribute.key]
            ? transform[attribute.key](attribute.value)
            : attribute.value
        }"`,
    )
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
  private templates: { storyEmail: HandlebarsTemplateDelegate };

  constructor() {
    this.templates = {
      storyEmail: compile(
        readFileSync(`${process.cwd()}/src/email/templates/story.handlebars`, {
          encoding: 'utf-8',
        }).toString(),
      ),
    };
  }

  /**
   * Convert an article HTML content to the corresponding mjml template.
   */
  htmlToMJML(html: string): string {
    let mjml = '';
    const json = parse(html);
    json.forEach((node) => {
      if (node.tagName === 'h2') {
        mjml += `<mj-text><h2>${inlineText(node.children)}</h2></mj-text>`;
      } else if (node.tagName === 'h3') {
        mjml += `<mj-text><h3>${inlineText(node.children)}</h3></mj-text>`;
      } else if (node.tagName === 'p') {
        mjml += `<mj-text>${inlineText(node.children)}</mj-text>`;
      } else if (node.tagName === 'ul' || node.tagName === 'ol') {
        mjml += `<mj-list>${node.children
          .map((child) => {
            if (child.tagName === 'li') {
              // If item is wrapped in a paragraph, unwrap it.
              if (child.children[0].tagName === 'p') {
                child.children = child.children[0].children;
              }
              return `<mj-li>${inlineText(child.children)}</mj-li>`;
            }
            return '';
          })
          .join('')}</mj-list>`;
      } else if (node.tagName === 'blockquote') {
        mjml += `<mj-text><blockquote>${inlineText(
          node.children,
        )}</blockquote></mj-text>`;
      } else if (node.tagName === 'img') {
        mjml += `<mj-image ${inlineAttributes(node.attributes, {
          // If the image src contains a space, encode it.
          src: (value) => (value.includes(' ') ? encodeURI(value) : value),
        })} />`;
      } else if (node.tagName === 'hr') {
        mjml += `<mj-divider />`;
      }
    });
    return mjml;
  }

  storyToMJML({
    username,
    story,
    settings,
  }: {
    username: string;
    story: Story;
    settings: SettingsFile;
  }): string {
    if (story.contentVersion !== '2') {
      throw new Error('Story content version 1 not allowed.');
    }

    return this.templates.storyEmail(
      {
        content: this.htmlToMJML(story.content),
        username: username,
        displayName: settings.siteName || username,
        settings,
      },
      {},
    );

    // TODO sanitise html
    // TODO CTA template
    // TODO unsubscribe link
  }
}
