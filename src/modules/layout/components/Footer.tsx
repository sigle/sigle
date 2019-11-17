import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import Link from 'next/link';
import {
  FaTwitter,
  FaGithub,
  FaTelegramPlane,
  FaFacebookF,
} from 'react-icons/fa';
import { Container } from '../../../components';
import { config } from '../../../config';

const StyledContainer = styled(Container)`
  ${tw`mt-8 py-8 text-right border-t border-solid border-grey-light`};

  a {
    ${tw`mr-4`};
  }
  a:last-child {
    ${tw`mr-0`};
  }
`;

const StyledLink = styled.a`
  ${tw`text-sm text-black no-underline cursor-pointer`};
  :hover {
    ${tw`text-pink`};
  }

  .icon {
    ${tw`inline-block`};
  }
`;

const iconSize = 16;

export const Footer = () => {
  return (
    <StyledContainer>
      <StyledLink
        href="https://app.sigle.io/sigleapp.id.blockstack"
        target="_blank"
      >
        Starter guide
      </StyledLink>
      <Link href="support">
        <StyledLink>Support</StyledLink>
      </Link>
      <StyledLink href={config.twitterUrl} target="_blank">
        <FaTwitter size={iconSize} className="icon" />
      </StyledLink>
      <StyledLink href={config.facebookUrl} target="_blank">
        <FaFacebookF size={iconSize} className="icon" />
      </StyledLink>
      <StyledLink href={config.telegramUrl} target="_blank">
        <FaTelegramPlane size={iconSize} className="icon" />
      </StyledLink>
      <StyledLink href={config.githubUrl} target="_blank">
        <FaGithub size={iconSize} className="icon" />
      </StyledLink>
    </StyledContainer>
  );
};
