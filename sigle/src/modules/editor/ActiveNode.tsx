import { Editor } from '@tiptap/react';
import { TextIcon } from '@radix-ui/react-icons';
import { slashCommands } from './extensions/SlashCommand/commands';

export const activeNode = (editor: Editor, storyId: string) => {
  if (editor.isActive('heading', { level: 2 })) {
    const bigHeading = slashCommands({ storyId }).find(
      (item) => item.title === 'Big Heading',
    );
    if (!bigHeading) {
      return;
    }
    const Icon = bigHeading.icon;
    return {
      name: bigHeading.title,
      icon: <Icon />,
    };
  }

  if (editor.isActive('heading', { level: 3 })) {
    const smallHeading = slashCommands({ storyId }).find(
      (item) => item.title === 'Small Heading',
    );
    if (!smallHeading) {
      return;
    }
    const Icon = smallHeading.icon;
    return {
      name: smallHeading.title,
      icon: <Icon />,
    };
  }

  if (editor.isActive('bulletList')) {
    const bulletList = slashCommands({ storyId }).find(
      (item) => item.title === 'Bulleted list',
    );
    if (!bulletList) {
      return;
    }
    const Icon = bulletList.icon;
    return {
      name: bulletList.title,
      icon: <Icon />,
    };
  }

  if (editor.isActive('orderedList')) {
    const numberedList = slashCommands({ storyId }).find(
      (item) => item.title === 'Numbered list',
    );
    if (!numberedList) {
      return;
    }
    const Icon = numberedList.icon;
    return {
      name: numberedList.title,
      icon: <Icon />,
    };
  }

  if (editor.isActive('blockquote')) {
    const quote = slashCommands({ storyId }).find(
      (item) => item.title === 'Quote',
    );
    if (!quote) {
      return;
    }
    const Icon = quote.icon;
    return {
      name: quote.title,
      icon: <Icon />,
    };
  }

  if (editor.isActive('codeBlock')) {
    const code = slashCommands({ storyId }).find(
      (item) => item.title === 'Code',
    );
    if (!code) {
      return;
    }
    const Icon = code.icon;
    return {
      name: code.title,
      icon: <Icon />,
    };
  }

  if (editor.isActive('twitter')) {
    const twitter = slashCommands({ storyId }).find(
      (item) => item.title === 'Twitter',
    );
    if (!twitter) {
      return;
    }
    const Icon = twitter.icon;
    return {
      name: twitter.title,
      icon: <Icon />,
    };
  }

  if (editor.isActive('twitter')) {
    const twitter = slashCommands({ storyId }).find(
      (item) => item.title === 'Twitter',
    );
    if (!twitter) {
      return;
    }
    const Icon = twitter.icon;
    return {
      name: twitter.title,
      icon: <Icon />,
    };
  }

  return { name: 'Plain Text', icon: <TextIcon /> };
};
