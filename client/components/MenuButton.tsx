import styled, { keyframes } from 'styled-components';
import tw from 'tailwind.macro';
import '@reach/menu-button/styles.css';
import {
  Menu,
  MenuList,
  MenuButton,
  MenuItem,
  MenuLink,
} from '@reach/menu-button';

const menuAnimation = keyframes`
  0% {
    transform: scale(.9);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const StyledMenuButton = styled(MenuButton)`
  :focus {
    outline: 0;
  }
`;

const StyledMenuList = styled(MenuList)`
  ${tw`mt-2 bg-white rounded-lg border shadow-md py-2`};
  min-width: 8rem;
  animation: ${menuAnimation} 75ms cubic-bezier(0, 0, 0.2, 1);

  > [data-reach-menu-item] {
    ${tw`px-4 py-2`};
  }

  > [data-reach-menu-item][data-selected] {
    ${tw`bg-black text-white lg:text-sm`};
  }

  > [data-reach-menu-item].primary {
    ${tw`text-primary`};
  }
  > [data-reach-menu-item][data-selected].primary {
    ${tw`bg-primary text-white`};
  }
`;

export {
  Menu,
  StyledMenuList as MenuList,
  StyledMenuButton as MenuButton,
  MenuItem,
  MenuLink,
};
