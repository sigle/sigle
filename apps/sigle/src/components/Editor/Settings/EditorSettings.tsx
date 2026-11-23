import { IconChevronRight } from "@tabler/icons-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useEditorStore } from "../store";
import { GeneralSettings } from "./GeneralSettings";
import { MetaSettings } from "./MetaSettings";

export const EditorSettings = () => {
  const menuOpen = useEditorStore((state) => state.menuOpen);
  const setMenuOpen = useEditorStore((state) => state.setMenuOpen);

  return (
    <Drawer open={!!menuOpen} onOpenChange={setMenuOpen} swipeDirection="right">
      <DrawerContent>
        {menuOpen === true ? (
          <div className="animate-in slide-in-from-right-5 fade-in">
            <DrawerHeader className="pt-6 pb-4">
              <DrawerTitle className="headline text-2xl">
                Post settings
              </DrawerTitle>
            </DrawerHeader>

            <div className="mx-4 border-t border-border">
              <GeneralSettings />

              <button
                type="button"
                className="group flex w-full items-center justify-between gap-4 border-b border-border py-4 text-left"
                onClick={() => setMenuOpen("meta")}
              >
                <span>
                  <span className="block text-sm font-medium">
                    Search and social preview
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    Title, description and canonical link.
                  </span>
                </span>
                <IconChevronRight
                  size={16}
                  className="shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                />
              </button>
            </div>
          </div>
        ) : null}

        {menuOpen === "meta" ? <MetaSettings /> : null}
      </DrawerContent>
    </Drawer>
  );
};
