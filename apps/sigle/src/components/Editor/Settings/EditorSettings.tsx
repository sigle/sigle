import { cn } from "@/lib/cn";
import { Dialog, Inset, Text } from "@radix-ui/themes";
import {
  IconBrandGoogle,
  IconCards,
  IconChevronRight,
} from "@tabler/icons-react";
import { useEditorStore } from "../store";
import { CollectSettings } from "./CollectSettings";
import { DialogTitle } from "./DialogTitle";
import { MetaSettings } from "./MetaSettings";
import styles from "./styles.module.css";

export const EditorSettings = () => {
  const menuOpen = useEditorStore((state) => state.menuOpen);
  const setMenuOpen = useEditorStore((state) => state.setMenuOpen);

  return (
    <Dialog.Root open={!!menuOpen} onOpenChange={setMenuOpen}>
      <Dialog.Content
        className={cn(
          "fixed inset-y-0 right-0 max-h-full max-w-[420px] rounded-none",
          styles.dialogContent,
        )}
      >
        {menuOpen === true ? (
          <div className="animate-in fade-in slide-in-from-right-5">
            <DialogTitle
              title="Post settings"
              description="Edit your post settings"
            />

            <Inset side="x">
              <div
                className="flex cursor-pointer justify-between border-y border-gray-5 px-6 py-4 transition-colors hover:bg-gray-2"
                onClick={() => setMenuOpen("meta")}
              >
                <Text
                  as="div"
                  weight="medium"
                  className="flex items-center gap-2"
                >
                  <IconBrandGoogle size={20} /> Meta SEO
                </Text>
                <Text as="div" color="gray">
                  <IconChevronRight size={24} />
                </Text>
              </div>
              <div
                className="flex cursor-pointer justify-between border-b border-gray-5 px-6 py-4 transition-colors hover:bg-gray-2"
                onClick={() => setMenuOpen("collect")}
              >
                <Text
                  as="div"
                  weight="medium"
                  className="flex items-center gap-2"
                >
                  <IconCards size={20} /> Collect settings
                </Text>
                <Text as="div" color="gray">
                  <IconChevronRight size={24} />
                </Text>
              </div>
            </Inset>
          </div>
        ) : null}

        {menuOpen === "meta" ? <MetaSettings /> : null}
        {menuOpen === "collect" ? <CollectSettings /> : null}
      </Dialog.Content>
    </Dialog.Root>
  );
};
