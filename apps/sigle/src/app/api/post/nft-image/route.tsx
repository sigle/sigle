import { ImageResponse } from "next/og";
import { z } from "zod";
import { resolveImageUrl } from "@/lib/images";
import { sigleApiFetchClient } from "@/lib/sigle";

const paramsSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  username: z.string().min(1, { message: "Username is required" }),
  coverImage: z.string().optional(),
});

export type CreatePostNftParams = z.infer<typeof paramsSchema>;

const size = {
  width: 450,
  height: 450,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const validationResult = paramsSchema.safeParse({
    title: searchParams.get("title"),
    username: searchParams.get("username"),
    coverImage: searchParams.get("coverImage") || undefined,
  });
  if (!validationResult.success) {
    return Response.json(
      { error: "Invalid parameters", details: validationResult.error.format() },
      { status: 400 },
    );
  }

  const { data: user } = await sigleApiFetchClient.GET(
    "/api/users/{username}",
    {
      params: {
        path: {
          username: validationResult.data.username,
        },
      },
    },
  );
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const title = validationResult.data.title;
  const avatar = user.profile?.pictureUri
    ? resolveImageUrl(user.profile.pictureUri.id)
    : undefined;
  const username = user.profile?.displayName;
  const handle = user.id;
  const coverImage = validationResult.data.coverImage
    ? resolveImageUrl(validationResult.data.coverImage)
    : undefined;

  return new ImageResponse(
    <div
      tw="flex flex-col h-full w-full justify-between items-start"
      style={{
        color: "#202020",
        backgroundColor: "#ffffff",
        fontFamily: '"Inter"',
      }}
    >
      {coverImage ? (
        <div tw="flex">
          {/* biome-ignore lint/performance/noImgElement: ok */}
          <img
            tw="w-full"
            src={coverImage}
            alt="coverImage"
            height={size.height / 2}
            style={{
              objectFit: "cover",
            }}
          />
        </div>
      ) : null}
      <div
        tw="flex w-full flex-col items-start px-6 py-6 justify-between"
        style={{
          height: coverImage ? size.height / 2 : size.height,
        }}
      >
        <div
          tw="text-4xl leading-10 overflow-hidden"
          style={{
            display: "block",
            lineClamp: 3,
            fontWeight: 500,
          }}
        >
          {title}
        </div>
        <div tw="flex w-full items-center justify-between">
          <div tw="flex items-center">
            {avatar ? (
              // biome-ignore lint/performance/noImgElement: ok
              <img
                tw="rounded-full"
                src={avatar}
                alt="avatar"
                height={50}
                width={50}
                style={{
                  objectFit: "cover",
                }}
              />
            ) : null}
            <div tw="flex flex-col ml-3">
              {username ? <div tw="text-xl">{username}</div> : null}
              <div
                tw="text-xs"
                style={{
                  color: "#646464",
                }}
              >
                {`@${handle}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
