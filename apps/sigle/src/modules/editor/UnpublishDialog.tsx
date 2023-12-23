import { Dialog, Text, Flex, Button } from '@radix-ui/themes';

interface UnpublishDialogProps {
  open: boolean;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const UnpublishDialog = ({
  open,
  loading,
  onConfirm,
  onClose,
}: UnpublishDialogProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Content size="3" className="max-w-[450px]">
        <Dialog.Title>Unpublish my story</Dialog.Title>
        <Dialog.Description className="space-y-2">
          <>
            <Text as="p">You’re about to unpublish this story.</Text>
            <Text as="p">
              It won’t be visible on your blog anymore but you still can see and
              edit it in your draft section.
            </Text>
          </>
        </Dialog.Description>
        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button size="2" variant="soft" color="gray" disabled={loading}>
              Cancel
            </Button>
          </Dialog.Close>
          <Button size="2" disabled={loading} onClick={onConfirm}>
            {loading ? 'Unpublishing ...' : 'Confirm'}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
