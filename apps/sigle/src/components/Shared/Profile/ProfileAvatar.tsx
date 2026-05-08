import { BlurImage } from "@/components/ui/blur-image";
import { cn } from "@/lib/cn";
import { resolveImageUrl } from "@/lib/images";
import { getDefaultAvatarUrl } from "@/lib/users";

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
  size: "2" | "3" | "8";
}) => {
  return (
    <div
      className={cn("overflow-hidden rounded-sm bg-muted", {
        "size-8": size === "2",
        "size-10": size === "3",
        "size-32": size === "8",
      })}
    >
      {user.profile?.pictureUri ? (
        <BlurImage
          src={resolveImageUrl(user.profile.pictureUri.id)}
          alt={user.id}
          className="size-full object-cover"
          blurhash={user.profile.pictureUri.blurhash}
          width={user.profile.pictureUri.width}
          height={user.profile.pictureUri.height}
        />
      ) : (
        // oxlint-disable-next-line no-img-element
        <img src={getDefaultAvatarUrl(user.id)} alt={user.id} />
      )}
    </div>
  );
};
