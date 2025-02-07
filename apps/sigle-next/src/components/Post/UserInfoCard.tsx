import type { paths } from '@/__generated__/sigle-api/openapi';
import { formatReadableAddress } from '@/lib/stacks';
import { Text } from '@radix-ui/themes';
import { ProfileMarkdownDescription } from '../Shared/Profile/MarkdownDescription';
import { Routes } from '@/lib/routes';
import { ProfileAvatar } from '../Shared/Profile/ProfileAvatar';
import { NextLink } from '../Shared/NextLink';

interface PostUserInfoCardProps {
  post: paths['/api/posts/{postId}']['get']['responses']['200']['content']['application/json'];
}

export const PostUserInfoCard = ({ post }: PostUserInfoCardProps) => {
  return (
    <div className="mt-10 p-5 bg-gray-3 rounded-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NextLink href={Routes.userProfile({ username: post.user.id })}>
            <ProfileAvatar user={post.user} size="2" />
          </NextLink>
          <div className="grid gap-0.5">
            <Text size="2" weight="medium" asChild>
              <NextLink href={Routes.userProfile({ username: post.user.id })}>
                {post.user.profile?.displayName}
              </NextLink>
            </Text>
            <Text size="1" color="gray" title={post.user.id} asChild>
              <NextLink href={Routes.userProfile({ username: post.user.id })}>
                {formatReadableAddress(post.user.id)}
              </NextLink>
            </Text>
          </div>
        </div>
      </div>
      {post.user.profile?.description ? (
        <Text as="p" color="gray" size="2" className="mt-3" asChild>
          <ProfileMarkdownDescription content={post.user.profile.description} />
        </Text>
      ) : null}
    </div>
  );
};
