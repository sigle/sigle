import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { Protected } from '../modules/auth/Protected';
import { DashboardLayout } from '../modules/layout';
import { DashboardPageContainer } from '../modules/layout/components/DashboardLayout';
import { DashboardPageTitle } from '../modules/layout/components/DashboardHeader';

const SupportUsTitle = styled.h2`
  ${tw`text-3xl mt-8`};
`;

const SupportUsSubtitle = styled.h4`
  ${tw`text-xl mt-10 mb-4`};
`;

const SupportUsMessage = styled.p`
  ${tw`mt-4 leading-normal`};
`;

const BuymeacoffeeButton = styled.div`
  ${tw`mt-8`};
  .bmc-button {
    justify-content: center;
    width: 35px;
    padding: 7px 10px 7px 10px !important;
    line-height: 35px !important;
    height: 51px !important;
    min-width: 217px !important;
    text-decoration: none !important;
    display: inline-flex !important;
    color: #ffffff !important;
    background-color: #ff5f5f !important;
    border-radius: 5px !important;
    border: 1px solid transparent !important;
    padding: 7px 10px 7px 10px !important;
    font-size: 22px !important;
    letter-spacing: 0.6px !important;
    box-shadow: 0px 1px 2px rgba(190, 190, 190, 0.5) !important;
    margin: 0 auto !important;
    transition: 0.3s all linear !important;
  }
  .bmc-button:hover,
  .bmc-button:active,
  .bmc-button:focus {
    -webkit-box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;
    text-decoration: none !important;
    box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;
    opacity: 0.85 !important;
    color: #ffffff !important;
  }
`;

const SupportUsPage = () => {
  return (
    <Protected>
      <DashboardLayout>
        <DashboardPageContainer>
          <DashboardPageTitle />
          <SupportUsTitle>
            Hey, you! You rock, I hope you know that.
          </SupportUsTitle>
          <SupportUsSubtitle>
            Thank you for visiting this page!
          </SupportUsSubtitle>
          <SupportUsMessage>
            Sigle is a <b>free</b> and <b>open-source</b> project built on top
            of Blockstack, but you can help us keep the project alive by buying
            us coffee! If you want to, you can support us with a one time
            donation or a monthly subscription. Isn’t that amazing?
          </SupportUsMessage>
          <SupportUsMessage>
            For any monthly subscription (or a 3 coffee donation), don’t forget
            to give us your address so we can thank you with some cool stickers
            🙂
          </SupportUsMessage>
          <SupportUsMessage>
            The money will help us:
            <br />- Cover the costs (server, domain...)
            <br />- Pay ourselves for the time we spend working on Sigle
            <br />- Buy some marketing products (such as stickers etc)
            <br />- Support our addiction to coffee (and tea, sometimes we
            prefer tea.)
          </SupportUsMessage>
          <div></div>
          <BuymeacoffeeButton>
            <a
              className="bmc-button"
              target="_blank"
              href="https://www.buymeacoffee.com/sigle"
            >
              <img
                src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
                alt="Support us"
              />
              <span style={{ marginLeft: 15, fontSize: 28 }}>Support us</span>
            </a>
          </BuymeacoffeeButton>
        </DashboardPageContainer>
      </DashboardLayout>
    </Protected>
  );
};

export default SupportUsPage;
