import React from 'react';
import * as Fathom from 'fathom-client';
import { userSession } from '../utils/blockstack';
import { Button } from '../components';
import { Goals } from '../utils/fathom';

const Login = () => {
  const handleLogin = () => {
    Fathom.trackGoal(Goals.LOGIN, 0);
    userSession.redirectToSignIn();
  };

  // TODO if user already logged in, redirect him to the app

  return (
    <React.Fragment>
      <div className="w-full h-screen hidden md:flex">
        <div className="flex-1 bg-grey-light" />
        <div
          className="flex-1 bg-no-repeat bg-contain bg-left"
          style={{ backgroundImage: "url('/static/img/logo-login.png')" }}
        />
      </div>
      <div className="absolute w-full h-screen top-0">
        <div className="md:flex items-center justify-center p-8 mx-auto h-full w-full max-w-6xl">
          <div className="md:w-1/2 flex flex-col text-left md:pr-32">
            <img
              className="mb-4"
              src="/static/img/logo.png"
              alt="Logo"
              width="100"
            />
            <p className="mb-4">
              Because Sigle is working on the decentralized internet thanks to
              the blockchain technology, you’ll be redicrected to{' '}
              <a
                className="text-pink"
                href="https://blockstack.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Blockstack
              </a>{' '}
              to login or sign in.
            </p>
            <p className="mb-4">
              Blockstack ID provides user-controlled login and storage that
              enable you to take back control of your identity and data.
            </p>
            <p className="mb-4">
              Creating a Blockstack ID is easy, free, and secure.
            </p>
            <p className="mb-4">
              Welcome to the family{' '}
              <span role="img" aria-label="Smile">
                🙂
              </span>
            </p>
            <div>
              <Button onClick={handleLogin}>Login with blockstack</Button>
            </div>
          </div>
          <div className="md:w-1/2 flex flex-col text-left items-center">
            <img
              className="mt-6 mb-4 max-w-full"
              src="/static/img/login.png"
              alt="Login image"
              width="400"
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Login;
