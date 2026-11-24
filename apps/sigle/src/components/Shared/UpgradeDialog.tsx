"use client";

import { IconExternalLink } from "@tabler/icons-react";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/cn";

/** Marks a feature free users see but can only use on the Pro plan. */
export const ProBadge = ({ className }: { className?: string }) => (
  <Badge className={cn("bg-accent text-accent-foreground", className)}>
    Pro
  </Badge>
);

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The Pro feature the user reached for, reported to PostHog. */
  trigger: "slash_image" | "image_drop" | "cover";
  title: string;
  description: string;
  /** A free alternative shown next to the upgrade button. */
  children?: React.ReactNode;
}

/**
 * Offers Pro to a free user who reached for a Pro feature. The Plan page opens
 * in a new tab, so the draft they are writing stays open.
 */
export const UpgradeDialog = ({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
}: UpgradeDialogProps) => {
  const posthog = usePostHog();

  useEffect(() => {
    if (open) {
      posthog.capture("upgrade_prompt_viewed", { trigger });
    }
  }, [open, posthog, trigger]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="headline text-xl">{title}</span>
            <ProBadge />
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {children}
          <Button
            nativeButton={false}
            render={
              <a href="/dashboard/plan" target="_blank" rel="noreferrer" />
            }
            onClick={() => {
              posthog.capture("upgrade_prompt_clicked", { trigger });
              onOpenChange(false);
            }}
          >
            Upgrade to Pro
            <IconExternalLink size={16} />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
