"use client";

import { IconAdjustmentsHorizontal, IconArrowLeft } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { NextLink } from "@/components/Shared/NextLink";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { EditorPostFormData } from "../EditorFormProvider";
import { useEditorStore } from "../store";
import { EditorPublish } from "./EditorPublish";
import { EditorSave } from "./EditorSave";

/**
 * Scroll logic taken from https://www.codemzy.com/blog/react-sticky-header-disappear-scroll
 */
export const EditorHeader = () => {
  const { watch } = useFormContext<EditorPostFormData>();
  const type = watch("type");
  const menuOpen = useEditorStore((state) => state.menuOpen);
  const setMenuOpen = useEditorStore((state) => state.setMenuOpen);

  const [scrollDirection, setScrollDirection] = useState<"down" | "up" | null>(
    null,
  );

  useEffect(() => {
    let lastScrollY = window.pageYOffset;

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      const direction = scrollY > lastScrollY ? "down" : "up";

      if (
        direction !== scrollDirection &&
        (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)
      ) {
        setScrollDirection(direction);
      }

      lastScrollY = scrollY > 0 ? scrollY : 0;
    };

    window.addEventListener("scroll", updateScrollDirection);

    return () => {
      window.removeEventListener("scroll", updateScrollDirection);
    };
  }, [scrollDirection]);

  return (
    <header
      className={cn(
        "sticky z-10 flex h-14 items-center border-b border-border bg-background px-4 transition-all duration-500 md:px-6",
        {
          "top-0": scrollDirection === "up",
          "-top-14": scrollDirection === "down",
        },
      )}
    >
      <div className="flex flex-1 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <NextLink
            href="/dashboard/drafts"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <IconArrowLeft size={16} />
            Drafts
          </NextLink>
          {type === "draft" ? <EditorSave /> : null}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Post settings"
            title="Post settings"
            className="text-muted-foreground"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <IconAdjustmentsHorizontal size={18} />
          </Button>
          <EditorPublish />
        </div>
      </div>
    </header>
  );
};
