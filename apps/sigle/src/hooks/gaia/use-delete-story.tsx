import { fetchStoriesControllerDelete } from '@/__generated__/sigle-api';
import { deleteStoryFile, getStoriesFile, saveStoriesFile } from '@/utils';
import { useMutation } from '@tanstack/react-query';

export const useDeleteStory = () => {
  return useMutation<
    boolean,
    string,
    {
      id: string;
    }
  >({
    mutationFn: async ({ id: storyId }) => {
      const file = await getStoriesFile();
      const index = file.stories.findIndex((s) => s.id === storyId);
      if (index === -1) {
        throw new Error('File not found in list');
      }
      file.stories.splice(index, 1);
      await saveStoriesFile(file);
      await deleteStoryFile(storyId);
      await fetchStoriesControllerDelete({
        body: { id: storyId },
      });
      return true;
    },
  });
};
