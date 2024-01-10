import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import { cn } from '@/lib/cn';

export const ImageComponent = (props: NodeViewProps) => {
  const alt = props.node.attrs.alt || '';
  const src = resolveImageUrl(props.node.attrs.src || '');
  const uploadId = props.node.attrs.uploadId;

  return (
    <NodeViewWrapper data-drag-handle className="relative">
      {uploadId && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={cn(
          'outline outline-0 outline-offset-2 outline-indigo-9 hover:outline-2',
          {
            ['outline-2']: props.selected,
            ['opacity-25']: uploadId,
          },
        )}
        src={src}
        alt={alt}
      />
    </NodeViewWrapper>
  );
};
