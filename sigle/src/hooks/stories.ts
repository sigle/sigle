import { useQuery } from '@tanstack/react-query';
import { StoriesService } from '../external/api';

type GetApiStoriesReturnType = Awaited<
  ReturnType<typeof StoriesService.storiesControllerGet>
>;
export const useGetStory = ({ storyId }: { storyId: string }) =>
  useQuery<GetApiStoriesReturnType, Error>(['get-story', storyId], () =>
    StoriesService.storiesControllerGet({ storyId })
  );
