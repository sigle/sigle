import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { AddEmailDto, UserService, VerifyEmailDto } from '../external/api';

type PostApiResendVerificationEmailReturnType = Awaited<
  ReturnType<typeof UserService.emailVerificationControllerResendEmail>
>;
export const useResendVerificationUserEmail = (
  options: UseMutationOptions<
    PostApiResendVerificationEmailReturnType,
    Error
  > = {},
) =>
  useMutation<PostApiResendVerificationEmailReturnType, Error>(
    () => UserService.emailVerificationControllerResendEmail(),
    options,
  );

type PostApiVerifyUserEmailReturnType = Awaited<
  ReturnType<typeof UserService.emailVerificationControllerVerifyEmail>
>;
export const useVerifyUserEmail = (
  options: UseMutationOptions<
    PostApiVerifyUserEmailReturnType,
    Error,
    VerifyEmailDto
  > = {},
) =>
  useMutation<PostApiVerifyUserEmailReturnType, Error, VerifyEmailDto>(
    (data) =>
      UserService.emailVerificationControllerVerifyEmail({
        requestBody: data,
      }),
    options,
  );
