"use client";

import type { ImageProps } from "next/image";
import Image from "next/image";
import { useMemo } from "react";
import { thumbHashToDataURL } from "thumbhash";

// Media dimensions are filled in by a background job, so an image can arrive
// without them. `next/image` requires both, the CSS of each image sets its
// displayed size anyway.
const FALLBACK_WIDTH = 1200;

const FALLBACK_HEIGHT = 675;

type BlurImageProps = Omit<
  ImageProps,
  "placeholder" | "blurDataURL" | "width" | "height"
> & {
  width: number | null;
  height: number | null;
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
      {...(width && height
        ? { width, height }
        : { width: FALLBACK_WIDTH, height: FALLBACK_HEIGHT })}
      placeholder={blurDataURL ? "blur" : "empty"}
      blurDataURL={blurDataURL}
    />
  );
}
