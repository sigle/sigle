import { resolve } from 'path';
import { printSchema } from 'graphql/utilities';

const generate = async () => {
  // Get the server schema
  const graphqlSetup = await import(
    resolve(__dirname, '../server/graphql/schema')
  );
  // Print it in the console
  console.log(printSchema(graphqlSetup.schema));
};

generate().catch(error => {
  console.error(error);
  process.exit(1);
});
