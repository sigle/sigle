/// <reference types="react-scripts" />

declare module 'the-platform';
declare module 'tailwind.macro' {
  function tailwindMacro(param: TemplateStringsArray);
  export = tailwindMacro;
}
declare module 'slate-soft-break';
