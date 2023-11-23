import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import {
  NewslettersService,
  UpdateNewsletterDto,
  UpdateContactsListDto,
  UpdateSenderDto,
} from '../external/api';

type PostApiNewsletterReturnType = Awaited<
  ReturnType<typeof NewslettersService.newslettersControllerUpdate>
>;
export const useUpdateNewsletter = (
  options: UseMutationOptions<
    PostApiNewsletterReturnType,
    Error,
    UpdateNewsletterDto
  > = {},
) =>
  useMutation<PostApiNewsletterReturnType, Error, UpdateNewsletterDto>(
    (args) =>
      NewslettersService.newslettersControllerUpdate({
        requestBody: args,
      }),
    options,
  );

type PostApiContactsListNewsletterReturnType = Awaited<
  ReturnType<typeof NewslettersService.newslettersControllerUpdateContactsList>
>;
export const useUpdateContactsListNewsletter = (
  options: UseMutationOptions<
    PostApiContactsListNewsletterReturnType,
    Error,
    UpdateContactsListDto
  > = {},
) =>
  useMutation<
    PostApiContactsListNewsletterReturnType,
    Error,
    UpdateContactsListDto
  >(
    (args) =>
      NewslettersService.newslettersControllerUpdateContactsList({
        requestBody: args,
      }),
    options,
  );

type PostApiSenderNewsletterReturnType = Awaited<
  ReturnType<typeof NewslettersService.newslettersControllerUpdateSender>
>;
export const useUpdateSenderNewsletter = (
  options: UseMutationOptions<
    PostApiSenderNewsletterReturnType,
    Error,
    UpdateSenderDto
  > = {},
) =>
  useMutation<PostApiSenderNewsletterReturnType, Error, UpdateSenderDto>(
    (args) =>
      NewslettersService.newslettersControllerUpdateSender({
        requestBody: args,
      }),
    options,
  );
