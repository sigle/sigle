declare namespace NodeJS {
  export interface ProcessEnv {
    API_URL: string;
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
