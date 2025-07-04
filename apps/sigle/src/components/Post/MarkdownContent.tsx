import ReactMarkdown from "react-markdown";
import { Tweet } from "react-tweet";
import { resolveImageUrl } from "@/lib/images";
import {
  getTweetIdFromUrl,
  isValidTwitterUrl,
} from "../Editor/extensions/Twitter/twitter";
import {
  getEmbedUrlFromYoutubeUrl,
  isValidYoutubeUrl,
} from "../Editor/extensions/Twitter/video";

interface PostMarkdownContentProps {
  content: string;
}

export const PostMarkdownContent = ({ content }: PostMarkdownContentProps) => {
  return (
    <div className="prose mt-10 lg:prose-lg dark:prose-invert">
      <ReactMarkdown
        components={{
          img: ({ node, src, ...props }) => {
            src = src ? resolveImageUrl(src as string) : undefined;
            // biome-ignore lint/a11y/useAltText: ok
            // biome-ignore lint/performance/noImgElement: ok
            return <img src={src} {...props} />;
          },
          a: ({ node, href, ...props }) => {
            if (href && isValidTwitterUrl(href)) {
              const tweetId = getTweetIdFromUrl(href);
              if (tweetId) {
                return <Tweet id={tweetId} />;
              }
            } else if (href && isValidYoutubeUrl(href)) {
              const url = getEmbedUrlFromYoutubeUrl({ url: href });
              if (url) {
                return (
                  <iframe
                    title="YouTube video player"
                    className="aspect-video w-full"
                    src={url}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allowFullScreen
                  />
                );
              }
            }

            return <a href={href} {...props} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
