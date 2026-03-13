"use client";

import type { paths } from "@sigle/sdk";
import { Badge, Link, Separator, Text } from "@radix-ui/themes";
import {
  IconCheck,
  IconChevronDown,
  IconCircleCheck,
  IconExternalLink,
  IconLink,
} from "@tabler/icons-react";
import { format } from "date-fns";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/Collapsible";
import { env } from "@/env";
import { getExplorerTransactionUrl } from "@/lib/stacks";

interface PostProvenanceCardProps {
  post: paths["/api/posts/{postId}"]["get"]["responses"]["200"]["content"]["application/json"];
}

type StorageType = "arweave" | "ipfs" | "external";

function getStorageType(metadataUri: string): StorageType {
  if (metadataUri.startsWith("ar://")) return "arweave";
  if (metadataUri.startsWith("ipfs://")) return "ipfs";
  return "external";
}

function getStorageLabel(type: StorageType): string {
  switch (type) {
    case "arweave":
      return "Arweave";
    case "ipfs":
      return "IPFS";
    case "external":
      return "External URL";
  }
}

function getMetadataLink(metadataUri: string): string {
  if (metadataUri.startsWith("ar://")) {
    return `${env.NEXT_PUBLIC_ARWEAVE_GATEWAY_URL}/${metadataUri.slice(5)}`;
  }
  if (metadataUri.startsWith("ipfs://")) {
    return `${env.NEXT_PUBLIC_IPFS_GATEWAY_URL}/${metadataUri.slice(7)}`;
  }
  return metadataUri;
}

export const PostProvenanceCard = ({ post }: PostProvenanceCardProps) => {
  const storageType = getStorageType(post.metadataUri);
  const storageLabel = getStorageLabel(storageType);
  const metadataLink = getMetadataLink(post.metadataUri);
  const explorerUrl = getExplorerTransactionUrl(post.txId);

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={`
            flex w-full cursor-pointer items-center justify-between rounded-lg
            border border-gray-6 px-4 py-3
            hover:bg-gray-4
          `}
        >
          <div className="w-full flex items-center justify-between text-left">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-9 rounded-lg bg-orange-9/10">
                <IconCircleCheck size={18} className="text-orange-9" />
              </div>
              <div>
                <Text as="p" size="2">
                  Verified On-Chain
                </Text>
                <Text as="p" size="1" color="gray">
                  Published {format(new Date(post.createdAt), "MMM dd, yyyy")}
                </Text>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge size="2" color="gray" highContrast>
                {storageLabel}
              </Badge>
              <IconChevronDown size={18} className="text-gray-10" />
            </div>
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-2 rounded-lg border border-gray-6 bg-gray-2 p-4">
          <div className="space-y-4">
            <div>
              <Text
                as="p"
                size="1"
                weight="medium"
                className="mb-2 text-gray-11"
              >
                Content Metadata
              </Text>
              <div className="flex items-center gap-2">
                <IconLink size={14} className="text-gray-10" />
                <Link
                  size="2"
                  highContrast
                  href={metadataLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  {post.metadataUri}
                  <IconExternalLink size={12} />
                </Link>
              </div>
            </div>

            <Separator size="2" />

            <div>
              <Text
                as="p"
                size="1"
                weight="medium"
                className="mb-2 text-gray-11"
              >
                Stacks Transaction
              </Text>
              <Link
                size="2"
                highContrast
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                {post.txId}
                <IconExternalLink size={12} />
              </Link>
            </div>
          </div>
        </div>

        <Text as="p" size="1" className="mt-3 text-gray-10">
          This post&apos;s content is permanently stored on Arweave, with a
          reference transaction on the Stacks blockchain that proves authorship
          and publication time.
        </Text>
      </CollapsibleContent>
    </Collapsible>
  );
};
