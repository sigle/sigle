import type { z } from "zod";
import * as Sentry from "@sentry/node";
import { getStepMetadata } from "workflow";
import { start } from "workflow/api";
import { consola } from "./consola";

// oxlint-disable-next-line typescript/no-explicit-any
export type WorkflowFn<T = any> = ((input: T) => Promise<any>) & {
  schema: z.ZodType<T>;
};

/**
 * Defines a durable workflow function by binding an input Zod schema.
 * Enforces that every workflow has a schema defined.
 */
export function defineWorkflow<T>(
  schema: z.ZodType<T>,
  workflowFn: (input: T) => Promise<any>,
): WorkflowFn<T> {
  const fn = workflowFn as WorkflowFn<T>;
  fn.schema = schema;
  return fn;
}

/**
 * Triggers a durable Vercel Workflow SDK workflow function.
 * Enforces and parses the workflow's input schema.
 */
export async function triggerWorkflow<T>(workflowFn: WorkflowFn<T>, input: T) {
  workflowFn.schema.parse(input);

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
