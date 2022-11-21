import { Injectable } from '@nestjs/common';
import { parse } from 'himalaya';
import { Story } from '../external/gaia';

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

  storyToMJML({ story }: { story: Story }): string {
    if (story.contentVersion !== '2') {
      throw new Error('Story content version 1 not allowed.');
    }

    const username = 'Antoine Lebowitch';

    const template = `<mjml>
    <mj-head>
      <mj-font
        name="Open Sans"
        href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap"
      />
      <mj-attributes>
        <mj-text font-family="Open Sans" font-size="15px" line-height="20px" />
        <mj-divider border-color="#E2E2E2" border-width="1px" />
      </mj-attributes>
    </mj-head>
    <mj-body>
      <mj-section>
        <mj-column>
          ${this.htmlToMJML(story.content)}
        </mj-column>
      </mj-section>
      <mj-section padding="0px 25px">
        <mj-column
          background-color="#F6F6F6"
          border-radius="12px"
          padding="20px 0px"
        >
          <mj-text align="center"
            ><a href="TODO"
              ><img
                src="https://app.sigle.io/img/emails/globe.png"
                width="15"
                height="15"
                style="margin-right: 12px" /></a
            ><a href="TODO"
              ><img
                src="https://app.sigle.io/img/emails/twitter.png"
                width="15"
                height="15" /></a
          ></mj-text>
          <mj-text align="center" color="#737373"
            ><a href="TODO" style="color: #737373; font-weight: 600"
              >Unsubscribe</a
            >
            from ${username}’s Newsletter.</mj-text
          >
          <mj-text align="center"
            ><a href="TODO"
              ><img
                src="https://app.sigle.io/img/emails/cta.png"
                width="143"
                height="28" /></a
          ></mj-text>
        </mj-column>
      </mj-section>
      <mj-section>
        <mj-column>
          <mj-divider />
          <mj-text color="#737373"
            >If you were forwarded this newsletter and you like it, you can
            subscribe
            <a href="TODO" style="color: #737373; font-weight: 600">here</a
            >.</mj-text
          >
          <mj-divider />
          <mj-text align="center" color="#737373">© Sigle 2022</mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>`;

    // TODO CTA template
    // TODO integrate https://www.npmjs.com/package/mjml-bullet-list for lists
    // TODO unsubscribe link

    return template;
  }
}
