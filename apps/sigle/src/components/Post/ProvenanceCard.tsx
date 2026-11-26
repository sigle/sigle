"use client";

import type { paths } from "@sigle/sdk";
import type { ReactNode } from "react";
import {
  IconArrowUpRight,
  IconCheck,
  IconClockHour4,
  IconCopy,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { LocalDate } from "@/components/Shared/LocalDate";
import { env } from "@/env";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";

interface PostProvenanceCardProps {
  post: paths["/api/posts/{postId}"]["get"]["responses"]["200"]["content"]["application/json"];
}

function truncateId(id: string, startChars = 8, endChars = 6): string {
  if (id.length <= startChars + endChars + 3) {
    return id;
  }

  return `${id.slice(0, startChars)}…${id.slice(-endChars)}`;
}

const arweaveLink = (txId: string): string =>
  `${env.NEXT_PUBLIC_ARWEAVE_GATEWAY_URL}/${txId}`;

export const PostProvenanceCard = ({ post }: PostProvenanceCardProps) => {
  // A failed timestamp is only retried by an admin, readers only see a proof
  // once it is pending or anchored in Bitcoin.
  const opentimestamps =
    post.opentimestamps?.status === "failed" ? null : post.opentimestamps;

  const bitcoinTimestamp = opentimestamps?.bitcoinTimestamp
    ? new Date(opentimestamps.bitcoinTimestamp)
    : null;

  const publishedAt = new Date(post.createdAt);

  return (
    <section aria-labelledby="provenance-title">
      <h2 id="provenance-title" className="headline text-xl">
        {bitcoinTimestamp ? "Permanent and timestamped" : "Permanently stored"}
      </h2>

      <ol className="mt-4">
        <ProvenanceStep
          state="done"
          title="Stored on Arweave"
          isLast={!opentimestamps}
        >
          <LocalDate date={publishedAt} />
          {post.arweaveBlockHeight === null
            ? null
            : ` · Block #${formatNumber(post.arweaveBlockHeight)}`}
        </ProvenanceStep>

        {opentimestamps ? (
          bitcoinTimestamp && opentimestamps.bitcoinBlockHeight !== null ? (
            <ProvenanceStep state="done" title="Timestamped on Bitcoin" isLast>
              <LocalDate date={bitcoinTimestamp} withTime /> · Block #
              {formatNumber(opentimestamps.bitcoinBlockHeight)}
            </ProvenanceStep>
          ) : (
            <ProvenanceStep
              state="pending"
              title="Timestamping on Bitcoin"
              isLast
            >
              Usually takes a few hours
            </ProvenanceStep>
          )
        ) : null}
      </ol>

      <Accordion className="mt-2 border-t border-border">
        <AccordionItem>
          <AccordionTrigger className="text-muted-foreground hover:text-foreground hover:no-underline">
            Verify it yourself
          </AccordionTrigger>
          <AccordionContent>
            <dl className="divide-y divide-border">
              <ProofRow
                label="Arweave transaction"
                value={post.arweaveTxId}
                href={arweaveLink(post.arweaveTxId)}
                linkLabel="View on Arweave"
              />
              {opentimestamps ? (
                <ProofRow label="SHA-256" value={opentimestamps.contentHash} />
              ) : null}
              {opentimestamps?.otsTxId ? (
                <ProofRow
                  label="OpenTimestamps proof"
                  value={opentimestamps.otsTxId}
                  href={arweaveLink(opentimestamps.otsTxId)}
                  linkLabel="Download .ots"
                />
              ) : null}
            </dl>
            {opentimestamps?.otsTxId ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Check the proof on{" "}
                <a
                  href="https://opentimestamps.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  opentimestamps.org
                </a>
              </p>
            ) : null}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
};

interface ProvenanceStepProps {
  state: "done" | "pending";
  title: string;
  isLast?: boolean;
  children: ReactNode;
}

const ProvenanceStep = ({
  state,
  title,
  isLast = false,
  children,
}: ProvenanceStepProps) => (
  <li className="relative flex gap-3 pb-4">
    {isLast ? null : (
      <span
        aria-hidden
        className={cn(
          "absolute top-7 bottom-1 left-2.75 w-px",
          state === "done" ? "bg-foreground/20" : "bg-border",
        )}
      />
    )}
    <span
      aria-hidden
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full",
        state === "done"
          ? "bg-foreground text-background"
          : "border border-dashed border-accent text-accent",
      )}
    >
      {state === "done" ? (
        <IconCheck size={14} stroke={2.5} />
      ) : (
        <IconClockHour4 size={14} />
      )}
    </span>
    <div className="min-w-0 pt-0.5">
      <p className="text-sm font-medium">
        {title}
        <span className="sr-only">
          {state === "done" ? " (done)" : " (in progress)"}
        </span>
      </p>
      <p className="mt-0.5 text-sm text-pretty text-muted-foreground">
        {children}
      </p>
    </div>
  </li>
);

interface ProofRowProps {
  label: string;
  value: string;
  href?: string;
  linkLabel?: string;
}

const ProofRow = ({ label, value, href, linkLabel }: ProofRowProps) => {
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="truncate font-mono text-sm" title={value}>
          {truncateId(value, 12, 8)}
        </dd>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Copy the ${label.toLowerCase()}`}
          className="text-muted-foreground"
          onClick={copyToClipboard}
        >
          <IconCopy size={14} />
        </Button>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs whitespace-nowrap text-muted-foreground no-underline! hover:text-foreground"
          >
            {linkLabel}
            <IconArrowUpRight size={12} />
          </a>
        ) : null}
      </div>
    </div>
  );
};
