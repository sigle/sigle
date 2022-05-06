import { aggregate } from './aggregate';

export interface FathomClientParams {
  apiToken: string;
  entityId: string;
}

export const initFathomClient = (clientParams: FathomClientParams) => {
  return {
    aggregate: aggregate(clientParams),
  };
};
