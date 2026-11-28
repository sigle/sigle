import { execFileSync } from "node:child_process";
import { WEB_ENV } from "./env";

execFileSync("pnpm", ["build"], {
  stdio: "inherit",
  env: { ...process.env, ...WEB_ENV },
});
