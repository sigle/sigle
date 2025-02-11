import type { NodeViewProps } from "@tiptap/core";
import { Tweet } from "react-tweet";
import { getTweetIdFromUrl } from "./twitter";

export const TwitterComponent = (props: NodeViewProps) => {
  const url: string = props.node.attrs.url;
  const tweetId = getTweetIdFromUrl(url);
  if (!tweetId) return null;

  return (
    <div className="mx-auto max-w-[550px]">
      <Tweet id={tweetId} />
    </div>
  );
};
