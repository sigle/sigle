"use client";

import {
  IconArrowLeft,
  IconLayoutSidebarRightExpand,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { NextLink } from "@/components/Shared/NextLink";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { EditorPostFormData } from "../EditorFormProvider";
import { useEditorStore } from "../store";
import { EditorPublish } from "./EditorPublish";
import { EditorSave } from "./EditorSave";

const headerIconSize = 20;

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
        `sticky z-10 flex h-[80px] items-center border-b border-gray-5 bg-gray-1 px-6 transition-all duration-500`,
        {
          "top-0": scrollDirection === "up",
          "-top-[80px]": scrollDirection === "down",
        },
      )}
    >
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            render={<NextLink href="/dashboard/drafts" />}
          >
            <IconArrowLeft size={headerIconSize} />
          </Button>
          {type === "draft" ? <EditorSave /> : null}
        </div>
        <div className="flex items-center gap-6">
          <EditorPublish />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <IconLayoutSidebarRightExpand size={headerIconSize} />
          </Button>
        </div>
      </div>
    </header>
  );
};
