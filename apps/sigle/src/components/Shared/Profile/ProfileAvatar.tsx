import type { paths } from "@sigle/sdk";
import { BlurImage } from "@/components/ui/blur-image";
import { cn } from "@/lib/cn";
import { resolveImageUrl } from "@/lib/images";
import { getDefaultAvatarUrl } from "@/lib/users";

type UserProfileResponse =
  paths["/api/users/{username}"]["get"]["responses"][200]["content"]["application/json"];

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
  size: "2" | "3" | "8";
}) => {
  const picture = user.profile?.picture;

  return (
    <div
      className={cn("overflow-hidden rounded-sm bg-muted", {
        "size-8": size === "2",
        "size-10": size === "3",
        "size-32": size === "8",
      })}
    >
      {picture ? (
        <BlurImage
          src={resolveImageUrl(picture.url)}
          alt={user.address}
          className="size-full object-cover"
          thumbhash={picture.thumbhash}
          width={picture.width ?? undefined}
          height={picture.height ?? undefined}
        />
      ) : (
        // oxlint-disable-next-line no-img-element
        <img src={getDefaultAvatarUrl(user.address)} alt={user.address} />
      )}
    </div>
  );
};
