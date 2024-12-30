/// <reference types="vitest" />

import { defineConfig } from 'vite';
import {
  vitestSetupFilePath,
  getClarinetVitestsArgv,
} from '@hirosystems/clarinet-sdk/vitest';

export default defineConfig({
  test: {
    environment: 'clarinet',
    pool: 'forks',
    poolOptions: {
      threads: { singleThread: true },
      forks: { singleFork: true },
    },
    setupFiles: [vitestSetupFilePath],
    environmentOptions: {
      clarinet: {
        ...getClarinetVitestsArgv(),
      },
    },
  },
});
