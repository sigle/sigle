"use client";

import type { paths } from "@sigle/sdk";
import { Badge, IconButton, Separator, Text } from "@radix-ui/themes";
import {
  IconChevronDown,
  IconCircleCheck,
  IconCopy,
  IconDatabase,
  IconExternalLink,
  IconLayersIntersect,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { toast } from "sonner";
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

function getMetadataId(metadataUri: string): string {
  if (metadataUri.startsWith("ar://") || metadataUri.startsWith("ipfs://")) {
    return metadataUri.split("://")[1];
  }
  return metadataUri;
}

function truncateId(id: string, startChars = 8, endChars = 6): string {
  if (id.length <= startChars + endChars + 3) return id;
  return `${id.slice(0, startChars)}...${id.slice(-endChars)}`;
}

export const PostProvenanceCard = ({ post }: PostProvenanceCardProps) => {
  const storageType = getStorageType(post.metadataUri);
  const storageLabel = getStorageLabel(storageType);
  const metadataLink = getMetadataLink(post.metadataUri);
  const metadataId = getMetadataId(post.metadataUri);
  const explorerUrl = getExplorerTransactionUrl(post.txId);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={`
            flex w-full cursor-pointer items-center justify-between rounded-lg
            border border-gray-6 px-4 py-3
          `}
        >
          <div className="flex w-full items-center justify-between text-left">
            <div className="flex items-center gap-3">
              <div
                className="
                  flex size-9 items-center justify-center rounded-lg
                  bg-orange-9/10
                "
              >
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
        <div className="space-y-4 rounded-lg border border-gray-6 p-4">
          <div>
            <Text
              as="p"
              size="1"
              color="gray"
              weight="medium"
              className="mb-2 flex items-center gap-2 uppercase"
            >
              <IconDatabase size={14} /> Content Metadata
            </Text>

            <div className="flex items-center gap-2">
              <Text as="p" className="flex-1 font-mono" size="2">
                {truncateId(metadataId, 12, 8)}
              </Text>
              <div className="flex items-center gap-3">
                <IconButton
                  variant="ghost"
                  color="gray"
                  size="3"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(metadataId);
                  }}
                >
                  <IconCopy size={16} />
                </IconButton>
                <IconButton variant="ghost" color="gray" size="3" asChild>
                  <a
                    href={metadataLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    <IconExternalLink size={16} />
                  </a>
                </IconButton>
              </div>
            </div>
          </div>

          <Separator size="2" />

          <div>
            <Text
              as="p"
              size="1"
              color="gray"
              weight="medium"
              className="mb-2 flex items-center gap-2 uppercase"
            >
              {/* TODO Stacks icon */}
              <IconLayersIntersect size={14} /> Stacks Transaction
            </Text>

            <div className="flex items-center gap-2">
              <Text as="p" className="flex-1 font-mono" size="2">
                {truncateId(post.txId, 10, 8)}
              </Text>
              <div className="flex items-center gap-3">
                <IconButton
                  variant="ghost"
                  color="gray"
                  size="3"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(post.txId);
                  }}
                >
                  <IconCopy size={16} />
                </IconButton>
                <IconButton variant="ghost" color="gray" size="3" asChild>
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    <IconExternalLink size={16} />
                  </a>
                </IconButton>
              </div>
            </div>
          </div>

          <Text as="p" size="1" className="mt-3 text-gray-10">
            This post&apos;s content is permanently stored on Arweave, with a
            reference transaction on the Stacks blockchain that proves
            authorship and publication time.
          </Text>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
