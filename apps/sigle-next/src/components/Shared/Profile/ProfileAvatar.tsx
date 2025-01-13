import { cn } from '@/lib/cn';
import { resolveImageUrl } from '@/lib/images';
import { getDefaultAvatarUrl } from '@/lib/users';

export const ProfileAvatar = ({
  user,
  size,
}: {
  user: {
    id: string;
    profile?: {
      pictureUri?: string;
    };
  };
  size: '2' | '3' | '8';
}) => {
  return (
    <div
      className={cn('bg-gray-3 rounded-2 overflow-hidden', {
        'size-8': size === '2',
        'size-10': size === '3',
        'size-32': size === '8',
      })}
    >
      {user.profile?.pictureUri ? (
        // TODO use next.js image component with blurhash
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolveImageUrl(user.profile.pictureUri)}
          className="size-full object-cover"
          alt={user.id}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={getDefaultAvatarUrl(user.id)} alt={user.id} />
      )}
    </div>
  );
};
