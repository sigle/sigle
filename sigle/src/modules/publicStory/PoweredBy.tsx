import styled from 'styled-components';
import tw from 'twin.macro';

const StyledPoweredBy = styled.div`
  ${tw`flex justify-center mt-16`};
  color: #c7c7c7;

  a {
    ${tw`flex flex-col items-center`};
  }

  img {
    ${tw`mt-1`};
    height: 25px;
  }
`;

export const PoweredBy = () => {
  return (
    <StyledPoweredBy>
      <a href="https://www.sigle.io/" target="_blank" rel="noopener noreferrer">
        Powered by <img src="/static/img/logo-gray.svg" alt="Logo Sigle" />
      </a>
    </StyledPoweredBy>
  );
};
