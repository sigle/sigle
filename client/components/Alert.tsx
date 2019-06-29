import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';

const AlertContainer = styled.div`
  ${tw`bg-red-100 border-l-4 border-primary text-primary p-4`};
`;

interface Props {
  children: React.ReactNode;
}

export const Alert = ({ children }: Props) => (
  <AlertContainer>{children}</AlertContainer>
);
