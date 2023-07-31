import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { SubscribersService, CreateSubscriberDto } from '../external/api';

type PostApiSubscribersReturnType = Awaited<
  ReturnType<typeof SubscribersService.subscribersControllerCreate>
>;
export const useCreateSubscribers = (
  options: UseMutationOptions<
    PostApiSubscribersReturnType,
    Error,
    CreateSubscriberDto
  > = {},
) =>
  useMutation<PostApiSubscribersReturnType, Error, CreateSubscriberDto>(
    (data) =>
      SubscribersService.subscribersControllerCreate({
        requestBody: data,
      }),
    options,
  );
