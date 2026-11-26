import type { NodeViewProps } from "@tiptap/core";
import { getEmbedUrlFromYoutubeUrl } from "./youtube";

export const VideoComponent = (props: NodeViewProps) => {
  const url = getEmbedUrlFromYoutubeUrl({
    url: String(props.node.attrs.url ?? ""),
  });

  return (
    <iframe
      title="YouTube video player"
      className="aspect-video w-full rounded-lg"
      src={url ?? undefined}
      width="100%"
      height="100%"
      frameBorder="0"
      allowFullScreen
    />
  );
};
