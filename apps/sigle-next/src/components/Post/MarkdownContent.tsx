import ReactMarkdown from 'react-markdown';
import { Tweet } from 'react-tweet';
import {
  getTweetIdFromUrl,
  isValidTwitterUrl,
} from '../Editor/extensions/Twitter/twitter';
import {
  getEmbedUrlFromYoutubeUrl,
  isValidYoutubeUrl,
} from '../Editor/extensions/Twitter/video';
import { resolveImageUrl } from '@/lib/images';

interface PublicationMarkdownContentProps {
  content: string;
}

export const PublicationMarkdownContent = ({
  content,
}: PublicationMarkdownContentProps) => {
  return (
    <ReactMarkdown
      className="prose mt-10 dark:prose-invert lg:prose-lg"
      components={{
        img: ({ node, src, ...props }) => {
          src = src ? resolveImageUrl(src) : undefined;
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
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
  );
};
