import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { Container } from '../../../components';
import { config } from '../../../config';

const FooterSection = styled.section`
  ${tw`bg-black text-white py-10`};
`;

const FooterProductHuntText = styled.p`
  ${tw`lg:text-sm mb-2`};
`;

const FooterBottom = styled.div`
  ${tw`flex flex-wrap mt-6`};
`;

const FooterCredit = styled.div`
  ${tw`w-full lg:w-1/2 flex items-center lg:text-sm`};
`;

const FooterLogo = styled.img`
  ${tw`mr-4`};
  height: 60px;
  width: 60px;
`;

const FooterSocial = styled.div`
  ${tw`w-full lg:w-1/2 lg:text-sm flex lg:justify-end lg:items-end mt-4 lg:mt-0`};
`;

const FooterSocialLink = styled.a`
  ${tw`hover:underline mr-6 lg:ml-6`};
`;

export const Footer = () => (
  <FooterSection>
    <Container>
      <FooterProductHuntText>Support us on Product Hunt!</FooterProductHuntText>
      <a
        href="https://www.producthunt.com/posts/sigle?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-sigle"
        target="_blank"
      >
        <img
          src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=145305&theme=light"
          alt="Sigle - A beautiful, decentralized and open source blog maker | Product Hunt Embed"
          width="200px"
          height="54px"
        />
      </a>

      <FooterBottom>
        <FooterCredit>
          <FooterLogo
            src="/static/images/logo_footer.png"
            alt="Sigle logo for the footer"
          />
          <div>
            <p>© Sigle 2019</p>
            <p>Developed by Leo Pradel</p>
            <p>Designed by Quentin Saubadu</p>
          </div>
        </FooterCredit>

        <FooterSocial>
          <div>
            <FooterSocialLink
              href={config.githubUrl}
              target="_blank"
              rel="nofollow"
            >
              GitHub
            </FooterSocialLink>
          </div>
          <div>
            <FooterSocialLink
              href={config.twitterUrl}
              target="_blank"
              rel="nofollow"
            >
              Twitter
            </FooterSocialLink>
          </div>
        </FooterSocial>
      </FooterBottom>
    </Container>
  </FooterSection>
);
