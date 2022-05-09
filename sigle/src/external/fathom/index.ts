import { aggregate } from './aggregate';
import { aggregatePath } from './aggregatePath';

export interface FathomClientParams {
  apiToken: string;
  entityId: string;
}

export const initFathomClient = (clientParams: FathomClientParams) => {
  return {
    aggregate: aggregate(clientParams),
    aggregatePath: aggregatePath(clientParams),
  };
};

export const fathomClient = initFathomClient({
  apiToken: process.env.FATHOM_API_TOKEN!,
  entityId: process.env.FATHOM_ENTITY_ID!,
});
