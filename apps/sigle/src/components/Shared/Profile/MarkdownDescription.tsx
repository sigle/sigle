import { Link } from "@radix-ui/themes";
import ReactMarkdown from "react-markdown";

interface ProfileMarkdownDescriptionProps {
  className?: string;
  content: string;
}

export const ProfileMarkdownDescription = ({
  className,
  content,
}: ProfileMarkdownDescriptionProps) => {
  return (
    <div className={className}>
      <ReactMarkdown
        allowedElements={["p", "a", "strong", "em"]}
        components={{
          a: ({ href, color, ...props }) => {
            return (
              <Link
                href={href}
                target="_blank"
                color="gray"
                highContrast
                // biome-ignore lint/suspicious/noExplicitAny: ok
                {...(props as any)}
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
