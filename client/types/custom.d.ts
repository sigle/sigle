declare module 'tailwind.macro' {
  import styled from 'styled-components';
  export const button = styled.button;
  export default (styles: TemplateStringsArray) => string;
}
