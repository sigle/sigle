import { type TypedDocumentNode } from '@graphql-typed-document-node/core';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { ComposeClient } from '@composedb/client';
import runtimeComposite from '../../ceramic/runtime-composite.json';

export const composeClient = new ComposeClient({
  ceramic: process.env.NEXT_PUBLIC_CERAMIC_API_URL!,
  definition: runtimeComposite as any,
});

export function useGraphQL<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): UseQueryResult<TResult> {
  return useQuery(
    [(document.definitions[0] as any).name.value, variables],
    async ({ queryKey }) =>
      composeClient.execute(document, queryKey[1] ? queryKey[1] : undefined)
  );
}
