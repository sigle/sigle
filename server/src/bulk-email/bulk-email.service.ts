import { readFileSync } from 'fs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { parse } from 'himalaya';
import { compile } from 'handlebars';
import { format } from 'date-fns';
import mjml2html from 'mjml';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { SettingsFile, Story } from '../external/gaia';
import { generateAvatar } from '../utils';

type MJMLAttribute = { key: string; value: string };

const inlineAttributes = (
  attributes: MJMLAttribute[],
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
      node.tagName === 'p' ||
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
export class BulkEmailService {
  private templates: { storyEmail: HandlebarsTemplateDelegate };

  constructor(@InjectSentry() private readonly sentryService: SentryService) {
    this.templates = {
      storyEmail: compile(
        readFileSync(
          `${process.cwd()}/src/bulk-email/templates/story.handlebars`,
          {
            encoding: 'utf-8',
          },
        ).toString(),
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
        mjml += `<mj-image ${inlineAttributes(node.attributes, {
          // If the image src contains a space, encode it.
          src: (value) => (value.includes(' ') ? encodeURI(value) : value),
        })} />`;
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
    stacksAddress,
    username,
    story,
    settings,
  }: {
    stacksAddress: string;
    username: string;
    story: Story;
    settings: SettingsFile;
  }): string {
    return this.templates.storyEmail(
      {
        content: this.htmlToMJML(story.content),
        username: username,
        profileUrl: `https://app.sigle.io/${username}`,
        storyUrl: `https://app.sigle.io/${username}/${story.id}`,
        date:
          process.env.NODE_ENV === 'test'
            ? format(story.createdAt, 'MMMM dd, yyyy')
            : format(new Date(), 'MMMM dd, yyyy'),
        displayName: settings.siteName || username,
        avatarUrl: settings.siteLogo
          ? settings.siteLogo.includes(' ')
            ? encodeURI(settings.siteLogo)
            : settings.siteLogo
          : generateAvatar(stacksAddress),
        story: {
          ...story,
          coverImage: story.coverImage?.includes(' ')
            ? encodeURI(story.coverImage)
            : story.coverImage,
        },
        settings,
      },
      {},
    );
  }

  storyToHTML({
    stacksAddress,
    username,
    story,
    settings,
  }: {
    stacksAddress: string;
    username: string;
    story: Story;
    settings: SettingsFile;
  }): string {
    if (story.contentVersion !== '2') {
      throw new Error('Story content version 1 not allowed.');
    }

    // TODO sanitise html
    // TODO unsubscribe link

    const MJMLNewsletter = this.storyToMJML({
      stacksAddress,
      username,
      story,
      settings,
    });

    const { html: mjmlHtml, errors: mjmlErrors } = mjml2html(MJMLNewsletter);
    if (mjmlErrors && mjmlErrors.length > 0) {
      this.sentryService
        .instance()
        .captureMessage('Failed to generate story newsletter', {
          level: 'error',
          extra: {
            stacksAddress,
            storyId: story.id,
            mjmlErrors,
            MJMLNewsletter,
          },
        });
      throw new BadRequestException('Failed to generate story newsletter');
    }
    return mjmlHtml;
  }
}
