import { styled } from '../../stitches.config';

const StyledPoweredBy = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  mt: '$4',
  color: '$gray8',

  '& a': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  '& img': {
    mt: '$1',
    height: 25,
  },
});

export const PoweredBy = () => {
  return (
    <StyledPoweredBy className="not-prose">
      <a href="https://www.sigle.io/" target="_blank" rel="noopener noreferrer">
        Powered by <img src="/static/img/logo-gray.svg" alt="Logo Sigle" />
      </a>
    </StyledPoweredBy>
  );
};
