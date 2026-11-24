import type { paths } from "@sigle/sdk";
import { IconArrowRight } from "@tabler/icons-react";
import { Routes } from "@/lib/routes";
import { formatReadableAddress } from "@/lib/stacks";
import { NextLink } from "../Shared/NextLink";
import { ProfileMarkdownDescription } from "../Shared/Profile/MarkdownDescription";
import { ProfileAvatar } from "../Shared/Profile/ProfileAvatar";

interface PostUserInfoCardProps {
  post: paths["/api/posts/{postId}"]["get"]["responses"]["200"]["content"]["application/json"];
}

export const PostUserInfoCard = ({ post }: PostUserInfoCardProps) => {
  const { author } = post;

  const profileHref = Routes.userProfile({ username: author.address });

  const name =
    author.profile?.displayName || formatReadableAddress(author.address);

  return (
    <section className="flex gap-4">
      <NextLink href={profileHref} className="shrink-0">
        <ProfileAvatar user={author} size="3" />
      </NextLink>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">Written by</p>
        <NextLink
          href={profileHref}
          title={author.address}
          className="headline text-xl underline-offset-4 hover:underline"
        >
          {name}
        </NextLink>
        {author.profile?.description ? (
          <ProfileMarkdownDescription
            content={author.profile.description}
            className="mt-2 text-sm text-pretty text-muted-foreground"
          />
        ) : null}
        <NextLink
          href={profileHref}
          className="mt-3 inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline"
        >
          More from {name}
          <IconArrowRight size={14} />
        </NextLink>
      </div>
    </section>
  );
};
