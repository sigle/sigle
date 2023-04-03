import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

interface PostCardProps {
  post: {
    id: string;
    coverImage?: string;
    title: string;
    content: string;
    createdAt: number;
  };
}

export const PostCard = ({ post }: PostCardProps) => {
  return (
    <Link href={`/posts/${post.id}`}>
      <div className="flex flex-col pointer relative transition-all duration-200 hover:-translate-y-1">
        <div className="text-[0.625rem] text-gray-500 uppercase">
          <div>{format(new Date(post.createdAt), 'MMMM dd, yyyy')}</div>
        </div>
        {post.coverImage && (
          <div className="mt-3 relative rounded-2xl	overflow-hidden aspect-[45/28]">
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
        <h3 className="mt-4 text-lg font-bold line-clamp-2">{post.title}</h3>
        <p className="mt-2 text-sm text-gray-500 line-clamp-4">
          {post.content}
        </p>
      </div>
    </Link>
  );
};
