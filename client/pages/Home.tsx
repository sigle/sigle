import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { Button, Container } from '../components';
import { Header } from '../modules/layout/components/Header';

const Hero = styled.div`
  background-color: #fcf8f3;
`;

const HeroContainer = styled.div`
  ${tw`flex flex-wrap items-center pt-16 pb-16 flex-row-reverse`};

  .block {
    ${tw`w-full lg:w-1/2`};
  }

  .article-container {
    ${tw`mx-auto`};
    max-width: 30rem;
  }

  .title {
    ${tw`text-4xl leading-snug mb-8 font-baskerville`};
  }

  .text {
    ${tw`mb-2`};
  }

  .button {
    border-radius: 2rem;
  }

  .figure-container {
    ${tw`flex item-center justify-center`};
  }

  img {
    width: 460px;
    height: 100%;
  }
`;

export const Home = () => (
  <React.Fragment>
    <Hero>
      <Header />
      <Container>
        <HeroContainer>
          <figure className="block">
            <div className="figure-container">
              <img src="/static/images/work.png" alt="Julia working" />
            </div>
          </figure>
          <article className="block">
            <div className="article-container">
              <h2 className="title">
                A decentralized & open source platform for writers
              </h2>
              <p className="text">
                Write, save, share. Easy... and free.
                <br />
                Sign in and start writting
              </p>
              <Button color="primary" className="button">
                Try it now
              </Button>
            </div>
          </article>
        </HeroContainer>
      </Container>
    </Hero>
  </React.Fragment>
);
