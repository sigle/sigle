import { Link, Separator, Text } from "@radix-ui/themes";
import type { paths } from "@sigle/sdk";
import { IconArrowUpRight } from "@tabler/icons-react";
import { getExplorerTransactionUrl } from "@/lib/stacks";

interface PostInfoCardProps {
  post: paths["/api/posts/{postId}"]["get"]["responses"]["200"]["content"]["application/json"];
}

export const PostInfoCard = ({ post }: PostInfoCardProps) => {
  const fullLink = post.metadataUri.startsWith("ar://")
    ? `https://arweave.net/${post.metadataUri.slice(5)}`
    : post.metadataUri;

  return (
    <div className="md:col-span-2">
      <div className="space-y-3">
        {/* <div className="flex justify-between">
          <Text as="p" weight="medium" size="2">
            Top minter
          </Text>
          <Link
            size="2"
            color="gray"
            highContrast
            href={getExplorerTransactionUrl(post.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            john.btc (4) <IconArrowUpRight size={16} />
          </Link>
        </div>
        <Separator size="4" /> */}
        <div className="flex justify-between">
          <Text as="p" weight="medium" size="2">
            Contract
          </Text>
          <Link
            size="2"
            color="gray"
            highContrast
            href={getExplorerTransactionUrl(post.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            explorer <IconArrowUpRight size={16} />
          </Link>
        </div>
        <Separator size="4" />
        <div className="flex justify-between">
          <Text as="p" weight="medium" size="2">
            Metadata
          </Text>
          <Link
            size="2"
            color="gray"
            highContrast
            href={fullLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            arweave <IconArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
