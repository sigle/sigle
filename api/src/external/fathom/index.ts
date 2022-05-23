import { config } from '../../config';
import { aggregate } from './aggregate';
import { aggregatePath } from './aggregatePath';
import { aggregateReferrers } from './aggregateReferrers';

export interface FathomClientParams {
  apiToken: string;
  entityId: string;
}

export const initFathomClient = (clientParams: FathomClientParams) => {
  return {
    aggregate: aggregate(clientParams),
    aggregatePath: aggregatePath(clientParams),
    aggregateReferrers: aggregateReferrers(clientParams),
  };
};

export const fathomClient = initFathomClient({
  apiToken: config.FATHOM_API_TOKEN,
  entityId: config.FATHOM_ENTITY_ID,
});
