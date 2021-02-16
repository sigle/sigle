/// <reference types="next" />
/// <reference types="next/types/global" />

// Type styled-components css prop
import { CSSProp } from 'styled-components';
declare module 'react' {
  interface DOMAttributes<T> {
    css?: CSSProp;
  }
}
declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      css?: CSSProp;
    }
  }
}
