import { execFileSync } from "node:child_process";
import { WEB_ENV } from "./env";

// Builds the website for the end-to-end tests into `.next`, where `pnpm
// start` serves it from. Run through turbo (`build:e2e`), which caches it.
execFileSync("pnpm", ["build"], {
  stdio: "inherit",
  env: { ...process.env, ...WEB_ENV },
});
