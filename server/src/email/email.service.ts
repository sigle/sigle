import { readFileSync } from 'fs';
import { Injectable } from '@nestjs/common';
import { parse } from 'himalaya';
import { compile } from 'handlebars';
import { SettingsFile, Story } from '../external/gaia';

type MJMLAttribute = { key: string; value: string };

const inlineAttributes = (attributes: MJMLAttribute[]): string =>
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
      } else if (node.tagName === 'div') {
        if (
          node.attributes.find(
            (attr: MJMLAttribute) => attr.key === 'data-twitter',
          )
        ) {
          const twitterUrl = node.attributes.find(
            (attr: MJMLAttribute) => attr.key === 'url',
          )?.value;
          mjml += `<mj-text><a href="${twitterUrl}">${twitterUrl}</a></mj-text>`;
        }
      } else if (node.tagName === 'img') {
        mjml += `<mj-image ${inlineAttributes(node.attributes)} />`;
      } else if (node.tagName === 'hr') {
        mjml += `<mj-divider />`;
      } else if (node.tagName === 'a') {
        // Make sure it's a CTA component
        if (
          node.attributes.find(
            (attr: MJMLAttribute) =>
              attr.key === 'data-type' && attr.value === 'button-cta',
          )
        ) {
          mjml += `<mj-button href="${
            node.attributes.find((attr: MJMLAttribute) => attr.key === 'href')
              ?.value
          }">${inlineText(node.children[0].children)}</mj-button>`;
        }
      }
    });
    return mjml;
  }

  storyToMJML({
    story,
    settings,
  }: {
    story: Story;
    settings: SettingsFile;
  }): string {
    if (story.contentVersion !== '2') {
      throw new Error('Story content version 1 not allowed.');
    }

    return this.templates.storyEmail(
      {
        content: this.htmlToMJML(story.content),
        user: {
          username: 'antoine.btc',
          displayName: 'Antoine Lebowitch',
        },
        settings,
      },
      {},
    );

    // TODO sanitise html
    // TODO integrate https://www.npmjs.com/package/mjml-bullet-list for lists
    // TODO unsubscribe link
  }
}
