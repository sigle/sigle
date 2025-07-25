"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { cn } from "@/lib/cn";
import styles from "./collapsible.module.css";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = ({
  className,
  ...props
}: CollapsiblePrimitive.CollapsibleContentProps) => (
  <CollapsiblePrimitive.CollapsibleContent
    {...props}
    className={cn(styles.collapsibleContent, className)}
  />
);

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
