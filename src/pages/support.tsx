import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import {
  FaFacebookMessenger,
  FaTelegramPlane,
  FaTwitter,
} from 'react-icons/fa';
import { AppBar, Footer } from '../modules/layout';
import { PageContainer } from '../modules/home/components/Home';
import { Button } from '../components';
import { config } from '../config';

const SupportBlock = styled.div`
  ${tw`md:flex justify-between py-6 border-b border-solid border-grey`};
`;

const ButtonContainer = styled.div`
  ${tw`flex items-center mt-4 md:mt-0`};
`;

const Title = styled.h1`
  ${tw`text-4xl font-bold mb-4`};
`;

const Illu = styled.img`
  ${tw`mb-4`};
  width: 250px;
`;

const SupportTitle = styled.h3`
  ${tw`text-2xl font-bold mb-4`};
`;

const SupportMessage = styled.p`
  ${tw`leading-normal`};
`;

const SupportMessageSocial = styled.p`
  ${tw`leading-normal mt-6 flex`};
`;

const SupportLink = styled.a`
  ${tw`text-pink`};
`;

const StyledLink = styled.a`
  ${tw`text-sm text-black no-underline cursor-pointer ml-2`};

  :hover {
    ${tw`text-pink`};
  }

  .icon {
    ${tw`inline-block`};
  }
`;

const SupportPage = () => {
  return (
    <React.Fragment>
      <AppBar />
      <PageContainer>
        <SupportBlock>
          <div>
            <Illu src="/static/img/support.png" alt="Three" />
            <Title>How can we help?</Title>
            <SupportMessage>
              Any question or feedback about Sigle? Or you just want to say
              hello 🙋‍♀️?
              <br />
              You're in the good place.
            </SupportMessage>
          </div>
        </SupportBlock>

        <SupportBlock>
          <div>
            <SupportTitle>Found an issue?</SupportTitle>
            <SupportMessage>
              Use the issue form to tell us what it is, or why you're having
              trouble using Sigle.
            </SupportMessage>
          </div>
          <ButtonContainer>
            <Button
              as="a"
              href="https://simpleform.xyz/submit/sigleapp.id.blockstack/6bc661b0-d09f-4909-a6a3-1960918d89d0"
              target="_blank"
            >
              Fill the issue form
            </Button>
          </ButtonContainer>
        </SupportBlock>

        <SupportBlock>
          <div>
            <SupportTitle>
              Any personal opinion or feedback to give?
            </SupportTitle>
            <SupportMessage>
              Use the feedback form to give us your advices or any constructive
              remarks.
            </SupportMessage>
          </div>
          <ButtonContainer>
            <Button
              as="a"
              href="https://simpleform.xyz/submit/sigleapp.id.blockstack/45296c0e-b5e9-485c-9096-0512203007e6"
              target="_blank"
            >
              Fill the feedback form
            </Button>
          </ButtonContainer>
        </SupportBlock>

        <SupportBlock>
          <div>
            <SupportTitle>Looking for a feature?</SupportTitle>
            <SupportMessage>
              We would be more than happy to improve Sigle to fit your needs.
            </SupportMessage>
          </div>
          <ButtonContainer>
            <Button
              as="a"
              href="https://simpleform.xyz/submit/sigleapp.id.blockstack/26372579-86c4-4fb8-b7a2-399aa24f4a0f"
              target="_blank"
            >
              Fill the feature form
            </Button>
          </ButtonContainer>
        </SupportBlock>

        <SupportBlock>
          <div>
            <SupportTitle>Just want to say hello?</SupportTitle>
            <SupportMessage>
              You also can get in touch with us by sending an e-mail :{' '}
              <SupportLink href={`mailto:${config.email}`}>
                {config.email}
              </SupportLink>
            </SupportMessage>
          </div>
        </SupportBlock>

        <SupportMessageSocial>
          You can also reach us on Messenger, Telegram and Twitter{' '}
          <StyledLink href={config.messengerUrl} target="_blank">
            <FaFacebookMessenger size={16} className="icon" />
          </StyledLink>
          <StyledLink href={config.telegramUrl} target="_blank">
            <FaTelegramPlane size={16} className="icon" />
          </StyledLink>
          <StyledLink href={config.twitterUrl} target="_blank">
            <FaTwitter size={16} className="icon" />
          </StyledLink>
        </SupportMessageSocial>
      </PageContainer>

      <Footer />
    </React.Fragment>
  );
};

export default SupportPage;
