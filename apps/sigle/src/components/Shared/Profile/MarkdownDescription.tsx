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
          // oxlint-disable-next-line no-unused-vars
          a: ({ href, ...props }) => {
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
                // oxlint-disable-next-line no-explicit-any
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
