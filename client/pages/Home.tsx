import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';
import { Button, Container } from '../components';
import { Header } from '../modules/layout/containers/Header';
import { Footer } from '../modules/layout/components/Footer';
import { config } from '../config';
import { SignInDialog } from '../modules/dialog/SignInDialog';

const BlackContainer = styled.div`
  ${tw`bg-black text-white`};
`;

const Hero = styled.div`
  ${tw`bg-grey-light`};

  @media (min-width: ${config.breakpoints.lg}px) {
    background-image url("/static/images/logo_landing.png");
    background-size: contain;
    background-repeat: no-repeat;
  }
`;

const ImageColumnContainer = styled.div<{ inverse?: boolean }>`
  ${tw`flex flex-wrap items-center`};

  ${props =>
    props.inverse &&
    css`
      ${tw`flex-row-reverse`};
    `}

  .block {
    ${tw`w-full lg:w-1/2`};
  }
  .block.small {
    ${tw`w-full lg:w-1/3`};
  }
  .block.big {
    ${tw`w-full lg:w-2/3`};
  }

  .article-container {
    ${tw`mx-auto`};
  }

  .title {
    ${tw`text-3xl leading-tight mb-8 font-baskerville`};
  }

  .text {
    ${tw`leading-relaxed mb-2`};
  }

  .figure-container {
    ${tw`flex items-center justify-center`};
  }

  img {
    width: 400px;
    height: 100%;
  }
  img.big {
    ${tw`lg:pl-4`};
    width: 100%;
  }

  a {
    ${tw`text-primary`};
  }
`;

const HeroContainer = styled(ImageColumnContainer)`
  ${tw`pt-16 pb-16`};

  .article-container {
    max-width: 30rem;
  }

  .title {
    ${tw`text-4xl`};
  }

  .text {
    ${tw`mb-2`};
  }

  img {
    width: 100%;
  }
`;

const SectionContainer = styled(Container)`
  ${tw`pt-16 pb-16`};
`;

const FeaturesContainer = styled.div`
  ${tw`pt-16 pb-16 lg:flex flex-wrap`};

  .block {
    ${tw`text-center mb-8 lg:mb-0 w-full lg:w-1/3 lg:px-4`};
  }

  img {
    ${tw`mb-2 mx-auto`};
    max-width: 55px;
  }

  .title {
    ${tw`text-3xl leading-tight font-baskerville mb-2`};
  }

  .divider {
    display: block;
    width: 80%;
    height: 1px;
    margin: 30px auto 0;
    background-color: #ededed;
  }

  .text {
    ${tw`leading-relaxed`};
    margin-top: 30px;
  }
`;

const FeaturesButton: any = styled(Button)`
  ${tw`bg-white mt-6 inline-block`};
`;

const SectionEnjoy = styled.section`
  ${tw`pt-16 pb-16 bg-grey-light`};

  img {
    width: 320px;
  }

  .article-container {
    max-width: none;
  }

  .text {
    ${tw`mb-2`};
  }
`;

const SectionReady = styled.section`
  ${tw`pt-16 pb-16 text-center`};

  .title {
    ${tw`text-3xl mb-2 font-baskerville`};
  }

  .easy {
    ${tw`mb-4`};
  }

  .button {
    ${tw`mb-2`};
  }

  a {
    ${tw`text-primary`};
  }
`;

export const Home = () => {
  const [loginOpen, setLoginOpen] = useState<boolean>(false);

  return (
    <React.Fragment>
      <SignInDialog open={loginOpen} onClose={() => setLoginOpen(false)} />

      <Hero>
        <Header />

        <Container>
          <HeroContainer inverse>
            <figure className="block big">
              <div className="figure-container">
                <img
                  className="big"
                  src="/static/images/home-demo.png"
                  alt="Julia working"
                />
              </div>
            </figure>
            <article className="block small">
              <div className="article-container">
                <h2 className="title">
                  A decentralized & open source platform for writers
                </h2>
                <p className="text">
                  Write, save, share. Easy... and free.
                  <br />
                  Sign in and start writting
                </p>
                <Button
                  color="primary"
                  size="large"
                  className="button"
                  onClick={() => setLoginOpen(true)}
                >
                  Try it now
                </Button>
              </div>
            </article>
          </HeroContainer>
        </Container>
      </Hero>

      <SectionContainer>
        <ImageColumnContainer>
          <figure className="block">
            <div className="figure-container">
              <img src="/static/images/work.png" alt="Julia working" />
            </div>
          </figure>
          <article className="block">
            <div className="article-container">
              <h2 className="title">
                A platform for writers who care about their contents
              </h2>
              <p className="text">
                When you write stories on websites such as Medium, keep in mind
                they can do whatever they want with your account and content.
              </p>
              <p className="text">
                <b>Sigle is different because it’s decentralized.</b>
                <br />
                We can neither ban nor delete your account or stories, or even
                see your personal information.
                <br />
                Start your writing career with #cantbeevil apps and don’t be
                afraid of losing all your work.
              </p>
            </div>
          </article>
        </ImageColumnContainer>
      </SectionContainer>

      <BlackContainer>
        <Container>
          <FeaturesContainer>
            <div className="block">
              <img
                src={require('../images/eye_white.png?size=70')}
                alt="Julia working"
              />
              <h4 className="title">Totally free</h4>
              <div className="divider" />
              <p className="text">
                Don’t pay to write.
                <br />
                Don’t pay to read.
                <br />
                Yes, this is totally free.
                <br />
                Sigle is a real reading and writing experience.
                <br />
                No advertising, no paid plan, no logging in in order to read a
                story…
                <br />
                We just focus on what matters: delivering the best content
                possible.
              </p>
            </div>

            <div className="block">
              <img
                src={require('../images/github_white.png?size=70')}
                alt="Julia working"
              />
              <h4 className="title">Open Source</h4>
              <div className="divider" />
              <p className="text">
                Sigle is an open source project created to respond to a
                passionate community.
                <br />
                Our code is totally transparent and you can even submit and code
                new features that will help us grow.
              </p>
              <FeaturesButton
                size="large"
                as={'a'}
                href={config.githubUrl}
                target="_blank"
              >
                Go on Github
              </FeaturesButton>
            </div>

            <div className="block">
              <img
                src={require('../images/type_white.png?size=70')}
                alt="Julia working"
              />
              <h4 className="title">Easy to use</h4>
              <div className="divider" />
              <p className="text">
                We’re committed to making your experience easy. Writing a story
                has never been easier than with V2 and we did everything in our
                power to make Sigle as smooth as possible.
                <br />
                Already on Medium? We are currently creating a tool that will
                help you migrate all your stories to Sigle.
              </p>
            </div>
          </FeaturesContainer>
        </Container>
      </BlackContainer>

      <SectionContainer>
        <ImageColumnContainer inverse>
          <figure className="block big">
            <div className="figure-container">
              <img
                className="big"
                src="/static/images/home-screens.png"
                alt="Julia working"
              />
            </div>
          </figure>
          <article className="block small">
            <div className="article-container">
              <h2 className="title">Draft it, publish it</h2>
              <p className="text">
                You don{"'"}t have to save your writings manually. Don{"'"}t
                worry, your browser can freeze, we{"'"}ve saved your content for
                you.
              </p>
              <p className="text">
                All your stories are first saved in the draft section. Because
                it’s encrypted, only you can see and edit it. Just publish your
                content when you feel ready to spread the world.
              </p>
            </div>
          </article>
        </ImageColumnContainer>
      </SectionContainer>

      <SectionEnjoy>
        <Container>
          <ImageColumnContainer inverse>
            <figure className="block">
              <div className="figure-container">
                <img src="/static/images/albator.png" alt="Julia Albator" />
              </div>
            </figure>
            <article className="block">
              <div className="article-container">
                <h2 className="title">Enjoy the power of decentralized data</h2>
                <p className="text">
                  <b>You are not a product to us.</b>
                  <br />
                  We really care about you and your privacy. What’s in your
                  drafts stays in your drafts and you’re the only one who can
                  access to it thanks to your blockstack private key.
                </p>
                <p className="text">
                  We have no information on your personal data, so we can’t sell
                  it to a third party. That is the power of the blockchain.
                </p>
                <p className="text">
                  <b>
                    Take your digital rights into your own hands and start
                    writing on a safe platform.
                  </b>
                </p>
              </div>
            </article>
          </ImageColumnContainer>
        </Container>
      </SectionEnjoy>

      <SectionReady>
        <Container>
          <h3 className="title">Ready to get started?</h3>
          <p className="easy">Take it easy, it{`'`}s free.</p>
          <Button
            color="primary"
            size="large"
            className="button"
            onClick={() => setLoginOpen(true)}
          >
            Try it now
          </Button>
          {/* <p className="lost">
            A bit lost?{' '}
            <a href="https://app.sigle.io/sigleapp.id.blockstack/L7I4iV6bYQ8WYvuT3RcoM">
              Check out the starter guide.
            </a>
          </p> */}
        </Container>
      </SectionReady>

      <Footer />
    </React.Fragment>
  );
};
