import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import { NewslettersService, UpdateNewsletterDto } from '../external/api';

type GetApiNewsletterReturnType = Awaited<
  ReturnType<typeof NewslettersService.newslettersControllerGet>
>;
export const useGetUserNewsletter = (
  options: UseQueryOptions<GetApiNewsletterReturnType, Error> = {}
) =>
  useQuery<GetApiNewsletterReturnType, Error>(
    ['get-user-newsletter'],
    () => NewslettersService.newslettersControllerGet(),
    options
  );

type PostApiNewsletterReturnType = Awaited<
  ReturnType<typeof NewslettersService.newslettersControllerUpdate>
>;
export const useUpdateNewsletter = (
  options: UseMutationOptions<
    PostApiNewsletterReturnType,
    Error,
    UpdateNewsletterDto
  > = {}
) =>
  useMutation<PostApiNewsletterReturnType, Error, UpdateNewsletterDto>(
    (args) =>
      NewslettersService.newslettersControllerUpdate({
        requestBody: args,
      }),
    options
  );
