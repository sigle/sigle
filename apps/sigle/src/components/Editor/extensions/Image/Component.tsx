import { Spinner } from "@radix-ui/themes";
import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { cn } from "@/lib/cn";
import { resolveImageUrl } from "@/lib/images";

export const ImageComponent = (props: NodeViewProps) => {
  const alt = props.node.attrs.alt || "";
  const src = resolveImageUrl(props.node.attrs.src || "", { gateway: true });
  const uploadId = props.node.attrs.uploadId;

  return (
    <NodeViewWrapper data-drag-handle className="relative">
      {uploadId && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      )}
      {/* biome-ignore lint/performance/noImgElement: ok */}
      <img
        className={cn(
          "outline outline-offset-2 outline-orange-9 hover:outline-2",
          {
            "outline-2": props.selected,
            "opacity-25": uploadId,
          },
        )}
        src={src}
        alt={alt}
      />
    </NodeViewWrapper>
  );
};
