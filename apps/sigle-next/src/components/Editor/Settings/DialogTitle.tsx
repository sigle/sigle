import { Dialog, Flex, IconButton, VisuallyHidden } from "@radix-ui/themes";
import { IconChevronLeft, IconX } from "@tabler/icons-react";
import { useEditorStore } from "../store";

interface DialogTitleProps {
  title: string;
  description: string;
}

export const DialogTitle = ({ title, description }: DialogTitleProps) => {
  return (
    <Flex justify="between" align="center" mb="5">
      <Dialog.Title mb="0">{title}</Dialog.Title>
      <VisuallyHidden>
        <Dialog.Description>{description}</Dialog.Description>
      </VisuallyHidden>
      <Dialog.Close>
        <IconButton variant="ghost" color="gray">
          <IconX size={20} />
        </IconButton>
      </Dialog.Close>
    </Flex>
  );
};

export const DialogTitleGoBack = ({ title }: DialogTitleProps) => {
  const setMenuOpen = useEditorStore((state) => state.setMenuOpen);

  return (
    <div className="mb-5 flex items-center gap-2">
      <button
        type="button"
        className="ml-[-6px] mt-[-4px]"
        onClick={() => setMenuOpen(true)}
      >
        <IconChevronLeft size={24} />
      </button>
      <Dialog.Title mb="0">{title}</Dialog.Title>
    </div>
  );
};
