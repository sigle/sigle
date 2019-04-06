declare module 'tailwind.macro' {
  import styled from 'styled-components';
  export const button = styled.button;
  export const div = styled.div;
  export default (styles: TemplateStringsArray) => string;
}
