/// <reference types="vitest" />

import {
  getClarinetVitestsArgv,
  vitestSetupFilePath,
} from "@hirosystems/clarinet-sdk/vitest";
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    environment: "clarinet",
    pool: "forks",
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
