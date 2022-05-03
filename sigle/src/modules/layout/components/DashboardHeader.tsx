import React from 'react';
import styledC from 'styled-components';
import tw from 'twin.macro';

export const PageTitleContainer = styledC.div`
  ${tw`mb-2 pb-4 lg:pb-8 flex flex-col-reverse lg:flex-row justify-between border-b border-solid border-grey`};
`;

export const PageTitle = styledC.div`
  ${tw`mt-6 lg:mt-0 text-xl font-bold flex items-center`};
`;

/**
 * Mobile menu
 */

interface DashboardPageTitleProps {
  title?: string;
}

export const DashboardPageTitle = ({ title }: DashboardPageTitleProps) => {
  return (
    <React.Fragment>
      <PageTitleContainer>
        <PageTitle>{title}</PageTitle>
      </PageTitleContainer>
    </React.Fragment>
  );
};
