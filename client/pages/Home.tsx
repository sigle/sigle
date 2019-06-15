import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';
import { Button, Container } from '../components';
import { Header } from '../modules/layout/components/Header';
import { Footer } from '../modules/layout/components/Footer';
import { config } from '../config';
import { SignInDialog } from '../modules/dialog/SignInDialog';

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

  .article-container {
    ${tw`mx-auto`};
    max-width: 22.5rem;
  }

  .title {
    ${tw`text-3xl leading-tight mb-8 font-baskerville`};
  }

  .text {
    ${tw`leading-relaxed`};
  }

  .figure-container {
    ${tw`flex items-center justify-center`};
  }

  img {
    width: 400px;
    height: 100%;
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
    width: 460px;
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

const SectionScreens = styled.section``;

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
              <img src="/static/images/one.png" alt="Julia working" />
            </div>
          </figure>
          <article className="block">
            <div className="article-container">
              <h2 className="title">
                Start writing awesome stories about whatever you want
              </h2>
              <p className="text">
                Our keyword: Simplicity.
                <br />
                Use our beautiful and unique editor to let your imagination
                running! Find all your articles in one minimalistic section,
                keep them secret or publish them.
              </p>
            </div>
          </article>
        </ImageColumnContainer>

        <ImageColumnContainer inverse>
          <figure className="block">
            <div className="figure-container">
              <img src="/static/images/two.png" alt="Julia working" />
            </div>
          </figure>
          <article className="block">
            <div className="article-container">
              <h2 className="title">Editing is as easy as ABC</h2>
              <p className="text">
                Use our WYSIWYG text editor, save and edit as you wish.
                <br />
                You can save your stories in your draft section or you can
                decide to publish and make them public for the community.
              </p>
            </div>
          </article>
        </ImageColumnContainer>

        <ImageColumnContainer>
          <figure className="block">
            <div className="figure-container">
              <img src="/static/images/three.png" alt="Julia working" />
            </div>
          </figure>
          <article className="block">
            <div className="article-container">
              <h2 className="title">
                Publish and share it... to the moon and back!
              </h2>
              <p className="text">
                You’re ready to share your article with the world?
                <br />
                Sigle allow you to make your stories famous by sharing it
                directly on the platform. Don’t miss the opportunity!
              </p>
            </div>
          </article>
        </ImageColumnContainer>
      </SectionContainer>

      <Container>
        <FeaturesContainer>
          <div className="block">
            <img src="/static/images/type.png" alt="Julia working" />
            <h4 className="title">
              Your blog…
              <br />
              decentralized
            </h4>
            <div className="divider" />
            <p className="text">
              Don{`'`}t want to give all your data away? Don{`'`}t want to risk
              losing all your work?
              <br />
              No worries, we have a solution for you.
              <br />
              <b>We created Sigle on blockstack to keep your data safe.</b>
            </p>
          </div>
          <div className="block">
            <img src="/static/images/github.png" alt="Julia working" />
            <h4 className="title">Free and Open Source</h4>
            <div className="divider" />
            <p className="text">
              Sigle is an <b>open source project</b> created to respond to a
              passionate community. The goal is to become one of the biggest
              blog editor apps on blockstack.
              <br />
              <b>
                We’re proud to make it happen and we hope you’ll enjoy writing
                amazing content on it.
              </b>
            </p>
          </div>
          <div className="block">
            <img src="/static/images/eye.png" alt="Julia working" />
            <h4 className="title">Simple & easy to use</h4>
            <div className="divider" />
            <p className="text">
              All your stories are available in two sections: drafts and
              published.
              <br />
              Keep your pages private and encrypted or make them public. Your
              pick!
              <br />
              <b>Follow us on social media to stay posted!</b>
            </p>
          </div>
        </FeaturesContainer>
      </Container>

      <SectionScreens>
        <img src="/static/images/screens.png" alt="Screens" />
      </SectionScreens>

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
                  When you use Sigle, you do way more than just writing awesome
                  stories, you’re also saying a huge « NO » to the big companies
                  which store your data to use it against you.
                  <br />
                  Congrats, you’re kind of a rebel now.
                </p>
                <p className="text">
                  Your data is safe with Blockstack. But if you don’t want
                  Blockstack keeping it for you, no problem:{' '}
                  <a
                    href="https://github.com/blockstack/gaia/blob/master/hub/README.md"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Click here
                  </a>{' '}
                  to read the tutorial on how to configure your own storage.
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
            color="black"
            size="large"
            className="button"
            onClick={() => setLoginOpen(true)}
          >
            Try it now
          </Button>
          <p className="lost">
            A bit lost?{' '}
            <a href="https://app.sigle.io/sigleapp.id.blockstack/L7I4iV6bYQ8WYvuT3RcoM">
              Check out the starter guide.
            </a>
          </p>
        </Container>
      </SectionReady>

      <Footer />
    </React.Fragment>
  );
};
