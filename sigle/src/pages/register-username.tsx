import React, { useState } from 'react';
import { Button, Flex, Heading, Text } from '../ui';
import { LoginLayout } from '../modules/layout/components/LoginLayout';
import { keyframes, styled } from '../stitches.config';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';

const spin = keyframes({
  to: { transform: 'rotate(360deg)' },
});

const LoadingSpinner = styled('div', {
  position: 'relative',
  px: '$4',

  '&::before': {
    content: '',
    boxSizing: 'border-box',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '$4',
    height: '$4',
    mt: '-8px',
    ml: '-8px',
    br: '$round',
    border: '1px solid $colors$gray8',
    borderTopColor: '$gray11',
    animation: `${spin} .7s linear infinite`,
  },
});

const ControlGroup = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  backgroundColor: '$gray3',
  boxShadow: '0 0 0 1px $colors$gray7',
  borderRadius: '$1',
  minWidth: 320,
  pr: '$2',
  pl: '$3',
  py: '$2',
  mb: '$4',

  '&:hover': {
    backgroundColor: '$gray4',
    boxShadow: '0 0 0 1px $colors$gray8',
  },

  '&:focus-within': {
    boxShadow: '0 0 0 2px $colors$gray8',
  },
});

const FormInput = styled('input', {
  outline: 'none',
  backgroundColor: 'transparent',
  fontSize: '$2',
  color: '$gray11',

  '&::placeholder': {
    color: '$gray9',
  },
});

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <LoginLayout>
      <Heading
        as="h1"
        size="2xl"
        css={{
          mt: '$5',
          fontWeight: '600',
        }}
      >
        One last step
      </Heading>
      <Text
        css={{
          mt: '$2',
          mb: '$3',
          color: '$gray10',
        }}
      >
        Choose a .id.stx username
      </Text>
      <form>
        <ControlGroup role="group">
          <FormInput
            disabled={isLoading ? true : false}
            placeholder="johndoe.id.stx"
          />
          <Button
            disabled={isLoading ? true : false}
            variant={isLoading ? 'ghost' : 'solid'}
            color="orange"
            css={{
              display: isLoading ? 'flex' : 'block',
              justifyContent: 'space-between',
              pointerEvents: isLoading ? 'none' : 'auto',
            }}
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                <Text size="sm" as="span">
                  Loading...
                </Text>
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </ControlGroup>
      </form>
      <Flex css={{ mb: '$5' }} align="center" gap="5">
        <Text
          css={{ color: '$orange11', '&:hover': { boxShadow: '0 1px 0 0' } }}
          size="sm"
          as="a"
          href="https://btc.us/"
          target="_blank"
          rel="noreferrer"
        >
          Or buy a .BTC domain instead
        </Text>
        <Text
          as="a"
          color="orange"
          href="https://docs.sigle.io/"
          target="_blank"
          rel="noreferrer"
          aria-label="Learn more"
        >
          <QuestionMarkCircledIcon />
        </Text>
      </Flex>
    </LoginLayout>
  );
};

export default Login;
