import * as Sentry from "@sentry/node";
import type PgBoss from "pg-boss";
import type { SendOptions, WorkHandler } from "pg-boss";
import type { z } from "zod";
import { consola } from "./consola";

class JobBuilder<TInput = any> {
  private _name: string;
  private _inputSchema?: z.ZodType<TInput>;
  private _options: SendOptions = {
    retryLimit: 3,
    retryDelay: 1000,
  };
  private _handler?: WorkHandler<TInput>;
  private _boss?: PgBoss;

  constructor(name: string) {
    this._name = name;
  }

  input<T>(schema: z.ZodType<T>): JobBuilder<T> {
    this._inputSchema = schema as any;
    return this as any;
  }

  options(opts: SendOptions): this {
    this._options = { ...this._options, ...opts };
    return this;
  }

  work(handler: WorkHandler<TInput>): this {
    const wrappedHandler: WorkHandler<TInput> = async (jobs) => {
      try {
        return await handler(jobs);
      } catch (error) {
        const job = jobs[0];
        consola.error(`Job ${this._name} failed`, error);
        Sentry.withScope((scope) => {
          scope.setTag("jobName", this._name);
          scope.setExtra("jobData", job.data);
          scope.setExtra("expireInSeconds", job.expireInSeconds);
          Sentry.captureException(error);
        });
        throw error;
      }
    };
    this._handler = wrappedHandler;
    return this;
  }

  // Internal method to set PgBoss instance
  _setBoss(boss: PgBoss): this {
    this._boss = boss;
    return this;
  }

  // Method to emit/schedule a job
  async emit(data: TInput) {
    if (!this._boss) {
      throw new Error("Job not registered with JobManager");
    }

    if (this._inputSchema) {
      // Validate input data against schema
      this._inputSchema.parse(data);
    }

    consola.debug("Job emitted", { name: this._name });
    return this._boss.send(this._name, data as any, this._options);
  }

  build() {
    if (!this._handler) {
      throw new Error(`No handler defined for job ${this._name}`);
    }

    return {
      name: this._name,
      schema: this._inputSchema,
      options: this._options,
      handler: this._handler,
    };
  }
}

export const defineJob = (name: string) => new JobBuilder(name);

export class JobManager {
  private boss: PgBoss;
  private jobs: JobBuilder[] = [];

  constructor(boss: PgBoss) {
    this.boss = boss;
  }

  register(...jobs: JobBuilder[]): this {
    for (const job of jobs) {
      // Set the PgBoss instance on each job
      job._setBoss(this.boss);
      this.jobs.push(job);
    }
    return this;
  }

  async start() {
    this.boss = await this.boss.start();

    for (const job of this.jobs) {
      const built = job.build();

      await this.boss.createQueue(built.name);
      await this.boss.work(built.name, built.handler);
    }
  }
}
