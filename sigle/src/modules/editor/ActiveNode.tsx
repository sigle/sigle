import {
  BulletedListLight,
  CodeLight,
  Heading2Light,
  Heading3Light,
  NumberedListLight,
  QuoteLight,
} from '../../icons';
import { Editor } from '@tiptap/react';
import { TextIcon } from '@radix-ui/react-icons';

export const activeNode = (editor: Editor) => {
  if (editor.isActive('heading', { level: 2 })) {
    return {
      name: 'Heading 2',
      icon: <Heading2Light />,
    };
  }

  if (editor.isActive('heading', { level: 3 })) {
    return {
      name: 'Heading 3',
      icon: <Heading3Light />,
    };
  }

  if (editor.isActive('bulletList')) {
    return {
      name: 'Bulleted list',
      icon: <BulletedListLight />,
    };
  }

  if (editor.isActive('orderedList')) {
    return {
      name: 'Numbered list',
      icon: <NumberedListLight />,
    };
  }

  if (editor.isActive('blockquote')) {
    return {
      name: 'Quote',
      icon: <QuoteLight />,
    };
  }

  if (editor.isActive('codeBlock')) {
    return {
      name: 'Code',
      icon: <CodeLight />,
    };
  }

  return { name: 'Plain Text', icon: <TextIcon /> };
};
