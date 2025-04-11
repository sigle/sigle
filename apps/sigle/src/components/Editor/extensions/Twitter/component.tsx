import { zodResolver } from "@hookform/resolvers/zod";
import { Text, TextField } from "@radix-ui/themes";
import { IconBrandX, IconBrandYoutube } from "@tabler/icons-react";
import type { NodeViewProps } from "@tiptap/core";
import { NodeViewWrapper } from "@tiptap/react";
import type React from "react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { TwitterComponent } from "./twitter/component";
import { TWITTER_REGEX_GLOBAL, isValidTwitterUrl } from "./twitter/twitter";
import { YOUTUBE_REGEX_GLOBAL, isValidYoutubeUrl } from "./video";
import { VideoComponent } from "./video/component";

export const isValidUrl = (val: string) => {
  return isValidTwitterUrl(val) || isValidYoutubeUrl(val);
};
export const globalPasteRegex = new RegExp(
  `(${YOUTUBE_REGEX_GLOBAL.source}|${TWITTER_REGEX_GLOBAL.source})`,
  "g",
);

const embedSchema = z.object({
  url: z.string().refine((val) => isValidUrl(val), {
    message: "Invalid embed url, this service is not supported.",
  }),
});

export const EmbedComponent = (props: NodeViewProps) => {
  const {
    register,
    handleSubmit,
    getValues,
    setFocus,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(embedSchema),
  });

  const url: string | undefined = props.node.attrs.url;
  const embedType = useMemo(() => {
    if (!url) return undefined;
    if (isValidTwitterUrl(url)) return "twitter";
    if (isValidYoutubeUrl(url)) return "video";
  }, [url]);

  // Override tiptap focus and focus on input instead
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!url) {
      setTimeout(() => {
        setFocus("url");
      }, 5);
    }
  }, [url, setFocus]);

  const onSubmit = handleSubmit((formValues) => {
    props.editor.commands.updateAttributes("embed", {
      ...props.node.attrs,
      url: formValues.url,
    });

    props.editor.commands.createParagraphNear();
  });

  // Remove input if empty and user presses backspace or delete key
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (
      (!getValues().url && event.key === "Backspace") ||
      event.key === "Delete"
    ) {
      props.deleteNode();
    }
  };

  return (
    <NodeViewWrapper data-embed>
      {!url && (
        <form onSubmit={onSubmit} className="space-y-2">
          <TextField.Root
            size="3"
            placeholder={
              props.node.attrs.embedType === "twitter"
                ? "Paste tweet URL and press “enter”..."
                : "Paste video URL and press “enter”..."
            }
            {...register("url")}
            onKeyDown={onKeyDown}
          >
            <TextField.Slot>
              {props.node.attrs.embedType === "twitter" ? (
                <IconBrandX height="16" width="16" />
              ) : null}
              {props.node.attrs.embedType === "video" ? (
                <IconBrandYoutube height="16" width="16" />
              ) : null}
            </TextField.Slot>
          </TextField.Root>
          {errors.url && (
            <Text as="div" size="2" color="red">
              {errors.url.message}
            </Text>
          )}
        </form>
      )}

      {embedType === "twitter" && <TwitterComponent {...props} />}
      {embedType === "video" && <VideoComponent {...props} />}
    </NodeViewWrapper>
  );
};
