import Html from 'slate-html-serializer';
import { Value } from 'slate';
import { sanitizeLink } from '../../../utils/security';

const rules = [
  {
    serialize(obj: any, children: any) {
      if (obj.object === 'block') {
        switch (obj.type) {
          case 'paragraph':
            return <p className={obj.data.get('className')}>{children}</p>;
          case 'block-quote':
            return <blockquote>{children}</blockquote>;
          case 'image':
            const src = obj.data.get('src');
            // eslint-disable-next-line
            return <img src={src} />;
          case 'list-item':
            return <li>{children}</li>;
          case 'numbered-list':
            return <ol>{children}</ol>;
          case 'bulleted-list':
            return <ul>{children}</ul>;
          /**
           * h1 is rendered as h2
           * h2 + h3 are rendered as h3
           */
          case 'heading-one':
            return <h2>{children}</h2>;
          case 'heading-two':
            return <h3>{children}</h3>;
          case 'heading-three':
            return <h3>{children}</h3>;
        }
      }
    },
  },
  {
    serialize(obj: any, children: any) {
      if (obj.object === 'mark') {
        switch (obj.type) {
          case 'bold':
            return <strong>{children}</strong>;
          case 'italic':
            return <em>{children}</em>;
          case 'underlined':
            return <u>{children}</u>;
          case 'code':
            return <code>{children}</code>;
        }
      }
    },
  },
  {
    serialize(obj: any, children: any) {
      if (obj.object === 'inline') {
        switch (obj.type) {
          case 'link':
            return (
              <a
                href={obj.data.get('href')}
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
        }
      }
    },
  },
];

const html = new Html({ rules });

export const convertSlateToHTML = (content: object): string => {
  return content ? html.serialize(Value.fromJSON(content)) : '';
};
