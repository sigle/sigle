import type { z } from "zod";
import * as Sentry from "@sentry/node";
import { getStepMetadata } from "workflow";
import { start } from "workflow/api";
import { consola } from "./consola";

/**
 * Triggers a durable Vercel Workflow SDK workflow function with optional Zod schema validation.
 */
export async function triggerWorkflow<T>(
  // oxlint-disable-next-line typescript/no-explicit-any
  workflowFn: (...args: any[]) => Promise<any>,
  input: T,
  schema?: z.ZodType<T>,
) {
  if (schema) {
    schema.parse(input);
  }

  consola.debug(`Triggering workflow ${workflowFn.name}`, { input });

  try {
    return await start(workflowFn, [input]);
  } catch (error) {
    consola.error(`Failed to trigger workflow ${workflowFn.name}`, error);
    Sentry.withScope((scope) => {
      scope.setTag("workflowName", workflowFn.name);
      scope.setExtra("input", input);
      Sentry.captureException(error);
    });
    throw error;
  }
}

/**
 * Executes a step body with Sentry error scoping and step metadata tagging.
 */
export async function withStepSentry<T>(
  stepName: string,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const meta = getStepMetadata();
    consola.error(`Step ${stepName} failed`, error);
    Sentry.withScope((scope) => {
      scope.setTag("stepName", stepName);
      if (meta) {
        scope.setExtra("stepMetadata", meta);
        scope.setExtra("stepAttempt", meta.attempt);
      }
      Sentry.captureException(error);
    });
    throw error;
  }
}
