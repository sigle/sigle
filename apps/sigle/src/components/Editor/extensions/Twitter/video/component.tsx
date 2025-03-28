import type { NodeViewProps } from "@tiptap/core";
import { getEmbedUrlFromYoutubeUrl } from "./youtube";

export const VideoComponent = (props: NodeViewProps) => {
  let url = props.node.attrs.url;
  url = getEmbedUrlFromYoutubeUrl({ url });

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
};
