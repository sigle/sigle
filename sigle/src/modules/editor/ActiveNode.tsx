import { Editor } from '@tiptap/react';
import { TextIcon } from '@radix-ui/react-icons';
import { slashCommands } from './extensions/SlashCommand/commands';

export const activeNode = (editor: Editor, storyId: string) => {
  if (editor.isActive('heading', { level: 2 })) {
    const bigHeading = slashCommands({ storyId }).filter(
      (item) => item.title === 'Big Heading'
    );
    const Icon = bigHeading[0].icon;
    return {
      name: bigHeading[0].title,
      icon: <Icon />,
    };
  }

  if (editor.isActive('heading', { level: 3 })) {
    const smallHeading = slashCommands({ storyId }).filter(
      (item) => item.title === 'Small Heading'
    );
    const Icon = smallHeading[0].icon;
    return {
      name: smallHeading[0].title,
      icon: <Icon />,
    };
  }

  if (editor.isActive('bulletList')) {
    const bulletList = slashCommands({ storyId }).filter(
      (item) => item.title === 'Bulleted list'
    );
    const Icon = bulletList[0].icon;
    return {
      name: bulletList[0].title,
      icon: <Icon />,
    };
  }

  if (editor.isActive('orderedList')) {
    const numberedList = slashCommands({ storyId }).filter(
      (item) => item.title === 'Numbered list'
    );
    const Icon = numberedList[0].icon;
    return {
      name: numberedList[0].title,
      icon: <Icon />,
    };
  }

  if (editor.isActive('blockquote')) {
    const quote = slashCommands({ storyId }).filter(
      (item) => item.title === 'Quote'
    );
    const Icon = quote[0].icon;
    return {
      name: quote[0].title,
      icon: <Icon />,
    };
  }

  if (editor.isActive('codeBlock')) {
    const code = slashCommands({ storyId }).filter(
      (item) => item.title === 'Code'
    );
    const Icon = code[0].icon;
    return {
      name: code[0].title,
      icon: <Icon />,
    };
  }

  return { name: 'Plain Text', icon: <TextIcon /> };
};
