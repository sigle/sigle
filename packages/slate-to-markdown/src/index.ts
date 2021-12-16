import { serialize } from 'remark-slate';
import { migrateSchema } from './migrate';

export const convert = (value: any): string => {
  return migrateSchema(value)
    .map((v: any) => serialize(v))
    .join('');
};
