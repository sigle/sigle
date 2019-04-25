declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'production' | 'development' | 'test';
    APP_URL: string;
    SENTRY_DSN_CLIENT?: string;
  }

  export interface Process {
    env: ProcessEnv;
  }
}

declare module 'tailwind.macro' {
  import styled from 'styled-components';
  export const button = styled.button;
  export const div = styled.div;
  export default (styles: TemplateStringsArray) => string;
}

// TODO remove once pr with types is merged
declare module 'radiks';

declare module 'slate-soft-break';
