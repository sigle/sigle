import styled from 'styled-components';
import tw from 'tailwind.macro';
import '@reach/menu-button/styles.css';
import {
  Menu,
  MenuList,
  MenuButton,
  MenuItem,
  MenuLink,
} from '@reach/menu-button';

let StyledMenuList = styled(MenuList)`
  ${tw`mt-2 bg-white rounded-lg border shadow-md py-2`};
  min-width: 8rem;

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

export { Menu, StyledMenuList as MenuList, MenuButton, MenuItem, MenuLink };
