import { IconChevronLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useEditorStore } from "../store";

export const DialogTitleGoBack = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  const setMenuOpen = useEditorStore((state) => state.setMenuOpen);

  return (
    <DrawerHeader className="mb-5 flex flex-row items-center">
      <Button
        className="mr-2"
        variant="ghost"
        onClick={() => setMenuOpen(true)}
      >
        <IconChevronLeft size={24} />
      </Button>
      <div>
        <DrawerTitle>{title}</DrawerTitle>
        <DrawerDescription>{description}</DrawerDescription>
      </div>
    </DrawerHeader>
  );
};
