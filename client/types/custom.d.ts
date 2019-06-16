declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'production' | 'development' | 'test';
    APP_URL: string;
    SENTRY_DSN_CLIENT?: string;
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

// Remove once https://github.com/reach/reach-ui/pull/150 is merged
declare module '@reach/menu-button';
declare module '@reach/dialog';
declare module '@reach/tabs';
