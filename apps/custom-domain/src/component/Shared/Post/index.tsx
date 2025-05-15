import { resolveImageUrl } from "@/lib/images";
import type { paths } from "@sigle/sdk";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";

interface PostCardProps {
  post: paths["/api/posts/list"]["get"]["responses"]["200"]["content"]["application/json"][0];
}

export const PostCard = ({ post }: PostCardProps) => {
  return (
    <Link href={`/posts/${post.id}`}>
      <div className="flex flex-col transition-all duration-200 hover:-translate-y-1">
        <div className="text-[0.625rem] uppercase tracking-wide text-gray-500">
          <div>{format(new Date(post.createdAt), "MMMM dd, yyyy")}</div>
        </div>
        {post.coverImage && (
          <div className="relative mt-3 aspect-[45/28]	overflow-hidden rounded-2xl">
            <Image
              src={resolveImageUrl(post.coverImage.id)}
              alt={post.title}
              className="size-full object-cover"
              placeholder={post.coverImage.blurhash ? "blur" : "empty"}
              blurDataURL={post.coverImage.blurhash}
              width={post.coverImage.width}
              height={post.coverImage.height}
            />
          </div>
        )}
        <h3 className="mt-4 line-clamp-2 text-lg font-bold">{post.title}</h3>
        <p className="mt-2 line-clamp-4 text-sm text-gray-500">
          {post.content}
        </p>
      </div>
    </Link>
  );
};
