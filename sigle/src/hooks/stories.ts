import {
  useMutation,
  UseMutationOptions,
  useQuery,
} from '@tanstack/react-query';
import { SendTestStoryDto, StoriesService } from '../external/api';

type GetApiStoriesReturnType = Awaited<
  ReturnType<typeof StoriesService.storiesControllerGet>
>;
export const useGetStory = ({ storyId }: { storyId: string }) =>
  useQuery<GetApiStoriesReturnType, Error>(['get-story', storyId], () =>
    StoriesService.storiesControllerGet({ storyId }),
  );

type PostApiSendTestStoryReturnType = Awaited<
  ReturnType<typeof StoriesService.storiesControllerSendTest>
>;
export const useSendStoryTest = (
  options: UseMutationOptions<
    PostApiSendTestStoryReturnType,
    Error,
    SendTestStoryDto
  > = {},
) =>
  useMutation<PostApiSendTestStoryReturnType, Error, SendTestStoryDto>(
    (data) =>
      StoriesService.storiesControllerSendTest({
        requestBody: data,
      }),
    options,
  );
