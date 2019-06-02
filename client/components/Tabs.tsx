import styled from 'styled-components';
import tw from 'tailwind.macro';
import '@reach/tabs/styles.css';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@reach/tabs';

const StyledTabs = styled(Tabs)`
  [data-reach-tab-list] {
    ${tw`bg-transparent mb-8`};
  }

  [data-reach-tab] {
    ${tw`font-medium`};
  }
  [data-reach-tab][data-selected] {
    ${tw`border-0 border-b border-solid border-black`};
  }
`;

export { StyledTabs as Tabs, Tab, TabList, TabPanels, TabPanel };
