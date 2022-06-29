import { UseQueryOptions, useQuery } from 'react-query';
import { sigleConfig } from '../config';

interface UserMeResponse {
  id: string;
  stacksAddress: string;
}

export const useGetUserMe = (
  options: UseQueryOptions<UserMeResponse, Error> = {}
) =>
  useQuery<UserMeResponse, Error>(
    'get-user-me',
    async () => {
      const res = await fetch(`${sigleConfig.apiUrl}/api/users/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await res.json();
      if (!res.ok) {
        throw json;
      }
      return json;
    },
    options
  );

type UserExploreResponse = {
  id: string;
  stacksAddress: string;
}[];

export const useGetUserExplore = (
  options: UseQueryOptions<UserExploreResponse, Error> = {}
) =>
  useQuery<UserExploreResponse, Error>(
    'get-user-explore',
    async () => {
      const res = await fetch(`${sigleConfig.apiUrl}/api/users/explore`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await res.json();
      if (!res.ok) {
        throw json;
      }
      return json;
    },
    options
  );
