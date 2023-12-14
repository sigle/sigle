import { styled } from '../../../stitches.config';
import { Heading } from '../../../ui';

const FullScreenLoadingContainer = styled('div', {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  img: {
    width: '250px',
  },
});

interface FullScreenLoadingProps {
  message?: string;
}

export const FullScreenLoading = ({
  message = 'Loading ...',
}: FullScreenLoadingProps) => {
  return (
    <FullScreenLoadingContainer>
      <img src="/static/img/logo.png" alt="Logo Sigle" />
      <Heading as="p" css={{ fontWeight: 600, mt: '$2' }}>
        {message}
      </Heading>
    </FullScreenLoadingContainer>
  );
};
