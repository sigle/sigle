import { cn } from '@/lib/cn';
import { resolveImageUrl } from '@/lib/images';
import { getDefaultAvatarUrl } from '@/lib/users';
import Image from 'next/image';

export const ProfileAvatar = ({
  user,
  size,
}: {
  user: {
    id: string;
    profile?: {
      pictureUri?: {
        id: string;
        width?: number;
        height?: number;
        blurhash?: string;
      };
    };
  };
  size: '2' | '3' | '8';
}) => {
  return (
    <div
      className={cn('overflow-hidden rounded-2 bg-gray-3', {
        'size-8': size === '2',
        'size-10': size === '3',
        'size-32': size === '8',
      })}
    >
      {user.profile?.pictureUri ? (
        <Image
          src={resolveImageUrl(user.profile.pictureUri.id)}
          alt={user.id}
          className="size-full object-cover"
          placeholder={user.profile.pictureUri.blurhash ? 'blur' : 'empty'}
          blurDataURL={user.profile.pictureUri.blurhash}
          width={user.profile.pictureUri.width}
          height={user.profile.pictureUri.height}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={getDefaultAvatarUrl(user.id)} alt={user.id} />
      )}
    </div>
  );
};
