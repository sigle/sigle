import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

interface FeaturedPostCardProps {
  post: {
    id: string;
    coverImage?: string;
    title: string;
    content: string;
    createdAt: number;
  };
}

export const FeaturedPostCard = ({ post }: FeaturedPostCardProps) => {
  return (
    <Link href={`/posts/${post.id}`}>
      <div className="mt-6 flex flex-col pointer relative transition-all duration-200 hover:-translate-y-1">
        <div className="text-[0.625rem] text-gray-500 tracking-wide uppercase">
          <div>{format(new Date(post.createdAt), 'MMMM dd, yyyy')}</div>
        </div>
        <div className="flex gap-4">
          {post.coverImage && (
            <div className="w-2/3 mt-3 relative rounded-2xl overflow-hidden aspect-[45/28]">
              <Image
                className="object-cover"
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw,
              (max-width: 1024px) 50vw,
              33vw"
              />
            </div>
          )}
          <div className="w-1/3 flex flex-col">
            <h3 className="text-4xl font-bold line-clamp-4 tracking-tight">
              {post.title}
            </h3>
            <p className="mt-2 text-sm text-gray-500 line-clamp-6">
              {post.content}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};
