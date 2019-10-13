declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'production' | 'development' | 'test';
    APP_URL: string;
    SENTRY_DSN_CLIENT?: string;
    FATHOM_SITE_ID?: string;
  }

  export interface Process {
    env: ProcessEnv;
    browser: boolean;
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
declare module '@convertkit/slate-lists';
