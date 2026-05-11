import ReactMarkdown from "react-markdown";
import { Tweet } from "react-tweet";
import remarkGfm from "remark-gfm";
import { resolveImageUrl } from "@/lib/images";
import {
  getTweetIdFromUrl,
  isValidTwitterUrl,
} from "../Editor/extensions/Twitter/twitter";
import {
  getEmbedUrlFromYoutubeUrl,
  isValidYoutubeUrl,
} from "../Editor/extensions/Twitter/video";

/**
 * Mirrors react-markdown's `defaultUrlTransform` but also allows `ipfs://` and
 * `ar://` protocols for decentralized storage URLs.
 *
 * @see https://github.com/remarkjs/react-markdown/blob/main/lib/index.js#L421
 */
function customUrlTransform(value: string): string {
  const colon = value.indexOf(":");
  const questionMark = value.indexOf("?");
  const numberSign = value.indexOf("#");
  const slash = value.indexOf("/");

  if (
    // If there is no protocol, it's relative.
    colon === -1 ||
    // If the first colon is after a `?`, `#`, or `/`, it's not a protocol.
    (slash !== -1 && colon > slash) ||
    (questionMark !== -1 && colon > questionMark) ||
    (numberSign !== -1 && colon > numberSign) ||
    // It is a protocol, it should be allowed.
    /^(https?|ircs?|mailto|xmpp|ipfs|ar)$/i.test(value.slice(0, colon))
  ) {
    return value;
  }

  return "";
}

interface PostMarkdownContentProps {
  content: string;
}

export const PostMarkdownContent = ({ content }: PostMarkdownContentProps) => {
  return (
    <div className="prose lg:prose-lg dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={customUrlTransform}
        components={{
          // oxlint-disable-next-line no-unused-vars
          img: ({ node: _node, src, ...props }) => {
            if (!src) return null;
            return (
              // oxlint-disable-next-line no-img-element
              <img
                {...props}
                src={resolveImageUrl(src as string, { gateway: true })}
              />
            );
          },
          // oxlint-disable-next-line no-unused-vars
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
