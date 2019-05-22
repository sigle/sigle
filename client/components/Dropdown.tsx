import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';

const DropdownContainer = styled.div`
  ${tw`absolute right-0 mt-2 w-32 bg-white rounded-lg border shadow-md py-2`};
  transform-origin: top right;
  z-index: 1;

  a {
    ${tw`block px-4 py-2 hover:bg-black hover:text-white lg:text-sm`};
  }
`;

interface DropdownProps {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
}

export const Dropdown = ({ children, open }: DropdownProps) => {
  // TODO listen to clicks outside to close it

  if (!open) {
    return null;
  }

  return (
    <DropdownContainer>
      <ul>{children}</ul>
    </DropdownContainer>
  );
};

interface DropdownItemProps {
  children: React.ReactNode;
}

export const DropdownItem = ({ children }: DropdownItemProps) => (
  <li>{children}</li>
);
