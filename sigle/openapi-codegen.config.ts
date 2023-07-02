import {
  generateSchemaTypes,
  generateReactQueryComponents,
} from '@openapi-codegen/typescript';
import { defineConfig } from '@openapi-codegen/cli';

export default defineConfig({
  sigleApi: {
    from: {
      source: 'url',
      url: 'http://0.0.0.0:3001/api/docs-json',
    },
    outputDir: 'src/__generated__/sigle-api',
    to: async (context) => {
      const filenamePrefix = 'sigleApi';
      const { schemasFiles } = await generateSchemaTypes(context, {
        filenamePrefix,
      });
      await generateReactQueryComponents(context, {
        filenamePrefix,
        schemasFiles,
      });
    },
  },
});
