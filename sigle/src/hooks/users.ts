import {
  UseQueryOptions,
  useQuery,
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query';
import { AddEmailDto, UserService, VerifyEmailDto } from '../external/api';

type GetApiUsersFollowingReturnType = Awaited<
  ReturnType<typeof UserService.userControllerGetUserFollowing>
>;
export const useGetUsersFollowing = (
  userAddress: string,
  options: UseQueryOptions<GetApiUsersFollowingReturnType, Error> = {},
) =>
  useQuery<GetApiUsersFollowingReturnType, Error>(
    ['get-users-following', userAddress],
    () => UserService.userControllerGetUserFollowing({ userAddress }),
    options,
  );

type GetApiUsersFollowersReturnType = Awaited<
  ReturnType<typeof UserService.userControllerGetUserFollowers>
>;
export const useGetUsersFollowers = (
  userAddress: string,
  options: UseQueryOptions<GetApiUsersFollowersReturnType, Error> = {},
) =>
  useQuery<GetApiUsersFollowersReturnType, Error>(
    ['get-users-followers', userAddress],
    () => UserService.userControllerGetUserFollowers({ userAddress }),
    options,
  );

type PostApiAddEmailReturnType = Awaited<
  ReturnType<typeof UserService.emailVerificationControllerAddEmail>
>;
export const useAddUserEmail = (
  options: UseMutationOptions<
    PostApiAddEmailReturnType,
    Error,
    AddEmailDto
  > = {},
) =>
  useMutation<PostApiAddEmailReturnType, Error, AddEmailDto>(
    (data) =>
      UserService.emailVerificationControllerAddEmail({
        requestBody: data,
      }),
    options,
  );

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
