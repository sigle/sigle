"use client";

import { IconCheck } from "@tabler/icons-react";
import { motion, useReducedMotion } from "motion/react";
import { NextLink } from "@/components/Shared/NextLink";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PUBLISH_LIMITS } from "@/lib/plans";

const UNLOCKED_FEATURES = [
  `${PUBLISH_LIMITS.pro} posts per day`,
  "Upload images to your posts",
  "Add cover images to your posts",
];

/** A compass, after the Jules Verne theme of the Explorer Guild. */
const Compass = ({ animate }: { animate: boolean }) => (
  <svg
    viewBox="0 0 44 44"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-11 text-accent"
    aria-hidden
  >
    <circle cx="22" cy="22" r="19" />
    <path d="M22 6v3M22 35v3M6 22h3M35 22h3" opacity={0.6} />
    <motion.g
      initial={animate ? { rotate: -300 } : false}
      animate={{ rotate: 0 }}
      transition={{ type: "spring", stiffness: 60, damping: 9, delay: 0.1 }}
    >
      <path
        d="M22 11l4.5 11L22 33l-4.5-11z"
        fill="currentColor"
        fillOpacity={0.25}
      />
      <path d="M22 11l4.5 11h-9z" fill="currentColor" />
    </motion.g>
  </svg>
);

interface ProWelcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Thanks the user right after they activate Pro. */
export const ProWelcomeDialog = ({
  open,
  onOpenChange,
}: ProWelcomeDialogProps) => {
  const animate = !useReducedMotion();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 p-6 sm:max-w-md">
        <DialogHeader className="gap-3">
          <Compass animate={animate} />
          <DialogTitle className="headline text-2xl">
            Welcome aboard, Explorer
          </DialogTitle>
          <DialogDescription className="text-pretty">
            Thank you for upgrading to Pro and supporting Sigle. Your Explorer
            Guild NFT helps keep Sigle independent and open source, and it means
            a lot to us.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2">
          {UNLOCKED_FEATURES.map((feature, index) => (
            <motion.li
              key={feature}
              className="flex items-center gap-2"
              initial={animate ? { opacity: 0, x: -6 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.15 }}
            >
              <IconCheck size={16} className="text-accent" />
              {feature}
            </motion.li>
          ))}
        </ul>

        <DialogFooter className="-mx-6 -mb-6 p-4 px-6">
          <DialogClose render={<Button variant="outline" />}>Done</DialogClose>
          <Button nativeButton={false} render={<NextLink href="/p/new" />}>
            Write a post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
