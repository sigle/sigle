"use client";

import Image, { type ImageProps } from "next/image";
import { useMemo } from "react";
import { thumbHashToDataURL } from "thumbhash";

type BlurImageProps = Omit<ImageProps, "placeholder" | "blurDataURL"> & {
  // Base64 ThumbHash placeholder, as returned by server-v2.
  thumbhash?: string | null;
};

export function BlurImage({
  thumbhash,
  alt,
  width,
  height,
  ...props
}: BlurImageProps) {
  const blurDataURL = useMemo(
    () =>
      thumbhash
        ? thumbHashToDataURL(
            Uint8Array.from(atob(thumbhash), (char) => char.charCodeAt(0)),
          )
        : undefined,
    [thumbhash],
  );

  return (
    <Image
      {...props}
      alt={alt}
      width={width ?? undefined}
      height={height ?? undefined}
      placeholder={blurDataURL ? "blur" : "empty"}
      blurDataURL={blurDataURL}
    />
  );
}
