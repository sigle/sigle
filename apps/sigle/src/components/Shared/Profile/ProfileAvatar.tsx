import type { paths } from "@sigle/sdk";
import { BlurImage } from "@/components/ui/blur-image";
import { cn } from "@/lib/cn";
import { resolveImageUrl } from "@/lib/images";
import { getDefaultAvatarUrl } from "@/lib/users";

type UserProfileResponse =
  paths["/api/users/{address}"]["get"]["responses"][200]["content"]["application/json"];

// Rendered size of each avatar size, so `next/image` picks a matching file
// instead of one as wide as the stored picture.
const AVATAR_PIXELS = { "2": 32, "3": 40, "6": 80, "8": 128 } as const;

export const ProfileAvatar = ({
  user,
  size,
}: {
  user: {
    address: string;
    profile?: {
      picture: NonNullable<UserProfileResponse["profile"]>["picture"];
    } | null;
  };
  size: "2" | "3" | "6" | "8";
}) => {
  const picture = user.profile?.picture;

  return (
    <div
      className={cn("overflow-hidden rounded-sm bg-muted", {
        "size-8": size === "2",
        "size-10": size === "3",
        "size-20": size === "6",
        "size-32": size === "8",
      })}
    >
      {picture ? (
        <BlurImage
          src={resolveImageUrl(picture.url)}
          alt={user.address}
          sizes={`${AVATAR_PIXELS[size]}px`}
          className="size-full object-cover"
          thumbhash={picture.thumbhash}
          width={picture.width}
          height={picture.height}
        />
      ) : (
        <img src={getDefaultAvatarUrl(user.address)} alt={user.address} />
      )}
    </div>
  );
};
