import { ComposeClient } from '@composedb/client';
import runtimeComposite from '../../ceramic/runtime-composite.json';

export const composeClient = new ComposeClient({
  ceramic: process.env.NEXT_PUBLIC_CERAMIC_API_URL!,
  definition: runtimeComposite as any,
});
