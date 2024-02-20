import { Button } from '@radix-ui/themes';
import { IconTrash } from '@tabler/icons-react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteStoryFile, getStoriesFile, saveStoriesFile } from '@/utils';
import { Story } from '@/types';
import { fetchStoriesControllerDelete } from '@/__generated__/sigle-api';

export const DeleteStory = () => {
  const router = useRouter();
  const params = useParams<{ storyId: string }>();
  const storyId = params!.storyId;
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleDelete = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();
    try {
      const result = window.confirm('Do you really want to delete this story?');
      if (!result) {
        return;
      }

      setLoadingDelete(true);
      const file = await getStoriesFile();
      const index = file.stories.findIndex((s) => s.id === storyId);
      if (index === -1) {
        throw new Error('File not found in list');
      }
      file.stories.splice(index, 1);
      await saveStoriesFile(file);
      await deleteStoryFile({ id: storyId } as Story);
      await fetchStoriesControllerDelete({
        body: { id: storyId },
      });
      router.push(`/`);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      setLoadingDelete(false);
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
