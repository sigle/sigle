import { cn } from "@/lib/cn";
import { resolveImageUrl } from "@/lib/images";
import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";

export const ImageComponent = (props: NodeViewProps) => {
  const alt = props.node.attrs.alt || "";
  const src = resolveImageUrl(props.node.attrs.src || "", { gateway: true });

  return (
    <NodeViewWrapper data-drag-handle className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={cn(
          "outline outline-0 outline-offset-2 outline-orange-9 hover:outline-2",
          {
            "outline-2": props.selected,
          },
        )}
        src={src}
        alt={alt}
      />
    </NodeViewWrapper>
  );
};
