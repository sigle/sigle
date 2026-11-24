import { IconArrowLeft } from "@tabler/icons-react";
import { DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useEditorStore } from "../store";

export const DialogTitleGoBack = ({ title }: { title: string }) => {
  const setMenuOpen = useEditorStore((state) => state.setMenuOpen);

  return (
    <DrawerHeader className="px-0 pt-6">
      <button
        type="button"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => setMenuOpen(true)}
      >
        <IconArrowLeft size={16} />
        Post settings
      </button>
      <DrawerTitle className="mt-3 headline text-2xl">{title}</DrawerTitle>
    </DrawerHeader>
  );
};
