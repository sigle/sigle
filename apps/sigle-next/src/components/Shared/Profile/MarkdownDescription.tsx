import { Link } from '@radix-ui/themes';
import ReactMarkdown from 'react-markdown';

interface ProfileMarkdownDescriptionProps {
  className?: string;
  content: string;
}

export const ProfileMarkdownDescription = ({
  className,
  content,
}: ProfileMarkdownDescriptionProps) => {
  return (
    <ReactMarkdown
      className={className}
      allowedElements={['p', 'a', 'strong', 'em']}
      components={{
        a: ({ href, color, ...props }) => {
          return (
            <Link
              href={href}
              target="_blank"
              color="gray"
              highContrast
              {...props}
            />
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
