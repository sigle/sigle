import {
  IconBrandGoogle,
  IconCards,
  IconChevronRight,
} from "@tabler/icons-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useEditorStore } from "../store";
import { CollectSettings } from "./CollectSettings";
import { GeneralSettings } from "./GeneralSettings";
import { MetaSettings } from "./MetaSettings";

export const EditorSettings = () => {
  const menuOpen = useEditorStore((state) => state.menuOpen);
  const setMenuOpen = useEditorStore((state) => state.setMenuOpen);
  const collectEnabled = false;

  return (
    <Drawer open={!!menuOpen} onOpenChange={setMenuOpen} direction="right">
      <DrawerContent>
        {menuOpen === true ? (
          <div className="animate-in slide-in-from-right-5 fade-in">
            <DrawerHeader>
              <DrawerTitle>Post settings</DrawerTitle>
              <DrawerDescription>Edit your post settings</DrawerDescription>
            </DrawerHeader>

            <div
              className="flex cursor-pointer justify-between border-y border-border p-4 transition-colors hover:bg-muted"
              onClick={() => setMenuOpen("meta")}
            >
              <div className="flex items-center gap-2 font-medium">
                <IconBrandGoogle size={20} /> Meta SEO
              </div>
              <div className="text-muted-foreground">
                <IconChevronRight size={20} />
              </div>
            </div>
            {collectEnabled ? (
              <div
                className="flex cursor-pointer justify-between border-b border-border p-4 transition-colors hover:bg-muted"
                onClick={() => setMenuOpen("collect")}
              >
                <div className="flex items-center gap-2 font-medium">
                  <IconCards size={20} /> NFT collection
                </div>
                <div className="text-muted-foreground">
                  <IconChevronRight size={20} />
                </div>
              </div>
            ) : null}
            <GeneralSettings />
          </div>
        ) : null}

        {menuOpen === "meta" ? <MetaSettings /> : null}
        {menuOpen === "collect" ? <CollectSettings /> : null}
      </DrawerContent>
    </Drawer>
  );
};
