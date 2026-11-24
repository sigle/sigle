import { format } from "date-fns";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ArweaveLogo } from "@/images/ArweaveLogo";
import { BitcoinLogo } from "@/images/BitcoinLogo";
import { LogoImage } from "@/images/Logo";
import { resolveImageUrl } from "@/lib/images";
import { sigleApiFetchClient } from "@/lib/sigle";
import { formatReadableAddress } from "@/lib/stacks";

export const alt = "A story published on Sigle";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// The fonts of the site: Newsreader for the title, Inter for the rest.
const fontsDirectory = join(process.cwd(), "assets/fonts");

const [newsreaderMedium, interRegular, interMedium] = await Promise.all([
  readFile(join(fontsDirectory, "Newsreader-Medium.ttf")),
  readFile(join(fontsDirectory, "Inter-Regular.ttf")),
  readFile(join(fontsDirectory, "Inter-Medium.ttf")),
]);

const COLORS = {
  foreground: "#0a0a0a",
  muted: "#737373",
  border: "#e5e5e5",
};

export default async function Image({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;

  const { data: post } = await sigleApiFetchClient.GET("/api/posts/{postId}", {
    params: {
      path: {
        postId,
      },
    },
  });

  if (!post) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const { author } = post;
  const picture = author.profile?.picture;

  // The PNG version of the default avatar, the image renderer cannot load SVGs.
  const avatar = picture
    ? resolveImageUrl(picture.url)
    : `https://api.dicebear.com/9.x/glass/png?seed=${author.address}`;

  return new ImageResponse(
    <div
      tw="flex h-full w-full flex-col justify-between bg-white px-20 py-18"
      style={{ color: COLORS.foreground, fontFamily: "Inter" }}
    >
      <LogoImage width={93} height={35} />

      <div tw="flex flex-col">
        <div
          style={{
            display: "block",
            fontFamily: "Newsreader",
            fontSize: 76,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            lineClamp: 3,
            // Balance titles of up to two lines, longer ones fill the lines
            // before they are clamped.
            textWrap: post.title.length <= 50 ? "balance" : "wrap",
          }}
        >
          {post.title}
        </div>
        <div tw="mt-6 text-3xl" style={{ color: COLORS.muted }}>
          {format(new Date(post.createdAt), "MMM d, yyyy")}
        </div>
      </div>

      <div
        tw="flex items-center justify-between pt-8"
        style={{ borderTop: `1px solid ${COLORS.border}` }}
      >
        <div tw="flex items-center">
          {/* oxlint-disable-next-line no-img-element */}
          <img
            tw="rounded-md"
            src={avatar}
            alt=""
            width={56}
            height={56}
            style={{ objectFit: "cover" }}
          />
          <div tw="ml-4 text-3xl" style={{ fontWeight: 500 }}>
            {author.profile?.displayName ||
              formatReadableAddress(author.address)}
          </div>
        </div>
        {/* Every post is archived on Arweave and timestamped on Bitcoin. */}
        <div tw="flex items-center">
          <ArweaveLogo width={44} height={44} color={COLORS.muted} />
          <div tw="flex ml-4">
            <BitcoinLogo width={44} height={44} color={COLORS.muted} />
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Newsreader", data: newsreaderMedium, weight: 500 },
        { name: "Inter", data: interRegular, weight: 400 },
        { name: "Inter", data: interMedium, weight: 500 },
      ],
    },
  );
}
