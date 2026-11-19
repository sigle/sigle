import { zodResolver } from "@hookform/resolvers/zod";
import { IconPhoto } from "@tabler/icons-react";
import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Field, FieldError } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/cn";
import { resolveImageUrl } from "@/lib/images";

const imageUrlSchema = z.object({
  url: z
    .url({
      protocol: /^https$/,
      message: "Enter a valid image URL starting with https://",
    })
    // Store the normalized URL, so characters such as spaces are encoded.
    .transform((url) => new URL(url).href),
});

/**
 * Shown for an image node without a source, so the image can be embedded from
 * an external URL instead of being uploaded.
 */
const ImageUrlForm = (props: NodeViewProps) => {
  const {
    register,
    handleSubmit,
    getValues,
    setFocus,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(imageUrlSchema),
  });

  // Override tiptap focus and focus on input instead
  useEffect(() => {
    setTimeout(() => {
      setFocus("url");
    }, 5);
  }, [setFocus]);

  const onSubmit = handleSubmit((formValues) => {
    props.updateAttributes({ src: formValues.url });
    props.editor.commands.createParagraphNear();
  });

  // Remove the input if empty and the user presses backspace or delete
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (
      !getValues().url &&
      (event.key === "Backspace" || event.key === "Delete")
    ) {
      props.deleteNode();
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <Field>
        <InputGroup>
          <InputGroupInput
            aria-invalid={!!errors.url}
            placeholder="Paste image URL and press “enter”..."
            {...register("url")}
            onKeyDown={onKeyDown}
          />
          <InputGroupAddon align="inline-start">
            <IconPhoto height="16" width="16" />
          </InputGroupAddon>
        </InputGroup>
        {errors.url && <FieldError>{errors.url.message}</FieldError>}
      </Field>
    </form>
  );
};

export const ImageComponent = (props: NodeViewProps) => {
  const alt = props.node.attrs.alt || "";
  const uploadId = props.node.attrs.uploadId;

  if (!props.node.attrs.src && !uploadId) {
    return (
      <NodeViewWrapper>
        <ImageUrlForm {...props} />
      </NodeViewWrapper>
    );
  }

  const src = resolveImageUrl(props.node.attrs.src || "", { gateway: true });

  return (
    <NodeViewWrapper data-drag-handle className="relative">
      {uploadId && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      )}
      {/* oxlint-disable-next-line no-img-element */}
      <img
        className={cn(
          `outline outline-offset-2 outline-accent hover:outline-2`,
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
