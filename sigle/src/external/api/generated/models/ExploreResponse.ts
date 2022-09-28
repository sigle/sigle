/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ExploreUser } from './ExploreUser';

export type ExploreResponse = {
  nextPage: number;
  data: Array<ExploreUser>;
};
