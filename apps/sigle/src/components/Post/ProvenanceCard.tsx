"use client";

import type { paths } from "@sigle/sdk";
import { IconArrowUpRight, IconCopy } from "@tabler/icons-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { env } from "@/env";
import { formatNumber } from "@/lib/utils";
import { Button, buttonVariants } from "../ui/button";

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

  // A failed timestamp is retried by the server, readers only see a proof
  // once it is pending or anchored in Bitcoin.
  const opentimestamps =
    post.opentimestamps?.status === "failed" ? null : post.opentimestamps;

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <section>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="headline text-xl">Verified on-chain</h2>
        <span className="text-xs text-muted-foreground">
          Published {format(new Date(post.createdAt), "MMM d, yyyy")}
        </span>
      </div>

      <dl className="mt-3 border-t border-border text-sm">
        <div className="flex items-center justify-between gap-4 border-b border-border py-3">
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">
              {storageLabel} ·{" "}
              {post.arweaveBlockHeight === null
                ? "Pending confirmation"
                : `Block #${formatNumber(post.arweaveBlockHeight)}`}
            </dt>
            <dd className="truncate font-mono text-sm">
              {truncateId(metadataId, 12, 8)}
            </dd>
          </div>
          <div className="flex shrink-0 items-center">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Copy the content ID"
              className="text-muted-foreground"
              onClick={() => copyToClipboard(metadataId)}
            >
              <IconCopy size={14} />
            </Button>
            <a
              href={metadataLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View on ${storageLabel}`}
              className={buttonVariants({
                variant: "ghost",
                size: "icon-sm",
                className: "text-muted-foreground",
              })}
            >
              <IconArrowUpRight size={14} />
            </a>
          </div>
        </div>

        {opentimestamps ? (
          <div className="flex items-center justify-between gap-4 border-b border-border py-3">
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">
                Bitcoin
                {opentimestamps.bitcoinBlockHeight === null
                  ? " · OpenTimestamps"
                  : ` · Block #${formatNumber(opentimestamps.bitcoinBlockHeight)}`}
              </dt>
              <dd>
                {opentimestamps.bitcoinTimestamp === null
                  ? "Pending Bitcoin confirmation"
                  : format(
                      new Date(opentimestamps.bitcoinTimestamp),
                      "MMM d, yyyy HH:mm",
                    )}
              </dd>
            </div>
            {opentimestamps.otsTxId ? (
              <a
                href={`${env.NEXT_PUBLIC_ARWEAVE_GATEWAY_URL}/${opentimestamps.otsTxId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                .ots proof
                <IconArrowUpRight size={12} />
              </a>
            ) : null}
          </div>
        ) : null}
      </dl>

      <p className="mt-3 text-xs/relaxed text-pretty text-muted-foreground">
        {opentimestamps?.bitcoinTimestamp
          ? "Stored permanently on Arweave and timestamped on Bitcoin with OpenTimestamps, proving who wrote it and when."
          : opentimestamps
            ? "Stored permanently on Arweave. The Bitcoin timestamp is waiting for confirmation."
            : "Stored permanently on Arweave."}
      </p>
    </section>
  );
};
