import { migrateSchema } from './migrate';

export const convert = (value: any): string => {
  return migrateSchema(value);
};
