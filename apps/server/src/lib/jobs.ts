import type { z } from "zod";
import * as Sentry from "@sentry/node";
import { start } from "workflow/api";
import { consola } from "./consola";

// oxlint-disable-next-line typescript/no-explicit-any
class JobBuilder<TInput = any> {
  private _name: string;
  private _inputSchema?: z.ZodType<TInput>;
  // oxlint-disable-next-line typescript/no-explicit-any
  private _workflowFn?: (...args: any[]) => Promise<any>;

  constructor(name: string) {
    this._name = name;
  }

  input<T>(schema: z.ZodType<T>): JobBuilder<T> {
    // oxlint-disable-next-line typescript/no-explicit-any
    this._inputSchema = schema as any;
    // oxlint-disable-next-line typescript/no-explicit-any
    return this as any;
  }

  // oxlint-disable-next-line typescript/no-explicit-any
  options(_opts: Record<string, any>): this {
    return this;
  }

  // oxlint-disable-next-line typescript/no-explicit-any
  work(workflowFn: (...args: any[]) => Promise<any>): this {
    this._workflowFn = workflowFn;
    return this;
  }

  async emit(data: TInput) {
    if (this._inputSchema) {
      this._inputSchema.parse(data);
    }

    consola.debug("Job emitted", { name: this._name });

    if (this._workflowFn) {
      try {
        return await start(this._workflowFn, [data]);
      } catch (error) {
        consola.error(`Failed to start job ${this._name}`, error);
        Sentry.withScope((scope) => {
          scope.setTag("jobName", this._name);
          scope.setExtra("jobData", data);
          Sentry.captureException(error);
        });
        throw error;
      }
    }

    return null;
  }
}

export const defineJob = (name: string) => new JobBuilder(name);
