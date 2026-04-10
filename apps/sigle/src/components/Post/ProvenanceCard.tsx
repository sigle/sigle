"use client";

import type { paths } from "@sigle/sdk";
import {
  IconCircleCheck,
  IconCopy,
  IconDatabase,
  IconExternalLink,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { env } from "@/env";
import { getExplorerTransactionUrl } from "@/lib/stacks";
import { formatNumber } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { IconStacksLogo } from "../ui/icons/IconStacksLogo";

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
    <Card>
      <CardContent>
        <Accordion>
          <AccordionItem value="provenance">
            <AccordionTrigger className="items-center py-0 hover:no-underline">
              <div className="mr-2 flex w-full items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-accent/10">
                    <IconCircleCheck size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Verified On-Chain
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Published{" "}
                      {format(new Date(post.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="text-xs font-medium capitalize"
                  >
                    {storageLabel}
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="mt-4 space-y-4 border-t border-border pt-4">
                {/* Metadata Storage */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    <IconDatabase size={14} />
                    <span>Content Metadata</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2.5">
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">
                        {storageLabel}
                      </span>
                      {/* oxlint-disable-next-line better-tailwindcss/enforce-consistent-line-wrapping */}
                      <span className="truncate font-mono text-sm text-foreground">
                        {truncateId(metadataId, 12, 8)}
                      </span>
                    </div>
                    <div className="ml-3 flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-8 p-0 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(metadataId);
                        }}
                      >
                        <IconCopy size={14} />
                      </Button>
                      <Button
                        nativeButton={false}
                        variant="ghost"
                        size="sm"
                        className="size-8 p-0 text-muted-foreground hover:text-foreground"
                        render={
                          <a
                            href={metadataLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          />
                        }
                      >
                        <IconExternalLink size={14} />
                        <span className="sr-only">View on {storageLabel}</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Stacks Transaction */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    <IconStacksLogo size={14} height={14} width={14} />
                    <span>Stacks Transaction</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2.5">
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">
                        Block #{formatNumber(post.blockHeight)}
                      </span>
                      {/* oxlint-disable-next-line better-tailwindcss/enforce-consistent-line-wrapping */}
                      <span className="truncate font-mono text-sm text-foreground">
                        {truncateId(post.txId, 10, 8)}
                      </span>
                    </div>
                    <div className="ml-3 flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-8 p-0 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(post.txId);
                        }}
                      >
                        <IconCopy size={14} />
                      </Button>
                      <Button
                        nativeButton={false}
                        variant="ghost"
                        size="sm"
                        className="size-8 p-0 text-muted-foreground hover:text-foreground"
                        render={
                          <a
                            href={explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          />
                        }
                      >
                        <IconExternalLink size={14} />
                        <span className="sr-only">View on {storageLabel}</span>
                      </Button>
                    </div>
                  </div>
                </div>

                <p className="pt-1 text-xs/relaxed text-muted-foreground">
                  This post&apos;s content is permanently stored on Arweave,
                  with a reference transaction on the Stacks blockchain that
                  proves authorship and publication time.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
