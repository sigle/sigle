/// <reference types="react-scripts" />

declare module 'blockstack';
declare module 'the-platform';
// TODO find a way to type it
declare module 'styled-components/macro';
declare module 'tailwind.macro' {
  function tailwindMacro(param: TemplateStringsArray);
  export = tailwindMacro;
}
