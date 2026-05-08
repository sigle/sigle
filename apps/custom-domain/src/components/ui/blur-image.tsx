"use client";

import { decode } from "blurhash";
import Image, { type ImageProps } from "next/image";
import { useMemo } from "react";

type BlurImageProps = Omit<ImageProps, "placeholder" | "blurDataURL"> & {
  blurhash?: string | null;
};

export function BlurImage({ blurhash, alt, ...props }: BlurImageProps) {
  const blurDataURL = useMemo(() => {
    if (!blurhash) return undefined;
    const pixels = decode(blurhash, 32, 32);
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.putImageData(new ImageData(pixels, 32, 32), 0, 0);
      return canvas.toDataURL();
    }
    return undefined;
  }, [blurhash]);

  return (
    <Image
      {...props}
      alt={alt}
      placeholder={blurDataURL ? "blur" : "empty"}
      blurDataURL={blurDataURL}
    />
  );
}
