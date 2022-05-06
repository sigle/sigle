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
