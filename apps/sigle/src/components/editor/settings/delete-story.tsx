import { Button } from '@radix-ui/themes';
import { IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { useDeleteStory } from '@/hooks/gaia/use-delete-story';

interface DeleteStoryProps {
  storyId: string;
}

export const DeleteStory = ({ storyId }: DeleteStoryProps) => {
  const router = useRouter();
  const { mutateAsync: deleteStory, isLoading: loadingDelete } =
    useDeleteStory();

  const handleDelete = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();
    try {
      const result = window.confirm('Do you really want to delete this story?');
      if (!result) {
        return;
      }

      await deleteStory({ id: storyId });
      router.push(`/`);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  return (
    <Button
      variant="soft"
      color="orange"
      onClick={handleDelete}
      disabled={loadingDelete}
    >
      <IconTrash size={16} />
      {loadingDelete ? 'Deleting...' : 'Delete'}
    </Button>
  );
};
