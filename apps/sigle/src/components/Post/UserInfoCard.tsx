import type { paths } from "@sigle/sdk";
import { Routes } from "@/lib/routes";
import { formatReadableAddress } from "@/lib/stacks";
import { NextLink } from "../Shared/NextLink";
import { ProfileMarkdownDescription } from "../Shared/Profile/MarkdownDescription";
import { ProfileAvatar } from "../Shared/Profile/ProfileAvatar";
import { Card, CardContent } from "../ui/card";

interface PostUserInfoCardProps {
  post: paths["/api/posts/{postId}"]["get"]["responses"]["200"]["content"]["application/json"];
}

export const PostUserInfoCard = ({ post }: PostUserInfoCardProps) => {
  const { author } = post;

  if (!author) {
    return null;
  }

  const profileHref = Routes.userProfile({ username: author.address });

  return (
    <Card className="mt-8">
      <CardContent className="space-y-2">
        <p
          // oxlint-disable-next-line better-tailwindcss/enforce-consistent-line-wrapping
          className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
        >
          Written by
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NextLink href={profileHref}>
              <ProfileAvatar user={author} size="2" />
            </NextLink>
            <div className="grid gap-0.5">
              {author.profile?.displayName ? (
                <p className="font-medium">
                  <NextLink href={profileHref}>
                    {author.profile?.displayName}
                  </NextLink>
                </p>
              ) : null}
              <p
                className="text-xs text-muted-foreground"
                title={author.address}
              >
                <NextLink href={profileHref}>
                  {formatReadableAddress(author.address)}
                </NextLink>
              </p>
            </div>
          </div>
        </div>

        {author.profile?.description ? (
          <div
            className="mt-3 text-xs text-muted-foreground"
            title={author.address}
          >
            <ProfileMarkdownDescription content={author.profile.description} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
