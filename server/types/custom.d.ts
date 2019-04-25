declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'production' | 'development' | 'test';
    SENTRY_DSN_SERVER?: string;
  }

  export interface Process {
    env: ProcessEnv;
  }
}

declare module 'radiks-server';
