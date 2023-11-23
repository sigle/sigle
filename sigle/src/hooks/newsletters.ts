import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import {
  NewslettersService,
  UpdateNewsletterDto,
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
