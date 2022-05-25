import dotenv from 'dotenv';

const result = dotenv.config({ path: '.env.test' });

if (result.error) {
  throw result.error;
}
