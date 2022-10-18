import { Cross2Icon } from '@radix-ui/react-icons';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { styled } from '../../stitches.config';
import { Button, IconButton, Typography } from '../../ui';

const PenRunContainer = styled('div', {
  display: 'none',
  mt: '$3',
  p: '$3',
  backgroundColor: '$orange4',
  boxShadow: '0 0 0 1px $colors$orange6',
  br: '$3',
  flexDirection: 'column',
  position: 'relative',
  alignItems: 'center',
  textAlign: 'center',
  maxWidth: 176,

  '@xl': {
    display: 'flex',
  },
});

export const PenRunCard = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>();

  useEffect(() => {
    const data = window.localStorage.getItem('show-pen-run-card');
    if (data) {
      setIsOpen(JSON.parse(data));
    } else {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('show-pen-run-card', JSON.stringify(isOpen));
  }, [isOpen]);

  return (
    <>
      {isOpen && (router.pathname === '/' || router.pathname === '/published') && (
        <PenRunContainer>
          <IconButton
            onClick={() => setIsOpen(false)}
            css={{
              position: 'absolute',
              right: '$3',
              top: '$3',

              '&:hover': {
                backgroundColor: '$orange6',
              },
              '&:active': {
                backgroundColor: '$orange7',
              },
            }}
          >
            <Cross2Icon />
          </IconButton>
          <Typography
            css={{ pt: '$5', mb: '$2', fontWeight: 600 }}
            size="subheading"
          >
            Ready, set... <br />
            Pen Run!
          </Typography>
          <Typography css={{ mb: '$5' }} size="subparagraph">
            First writing contest <br />
            on Sigle, live now!
          </Typography>
          <Button
            css={{
              width: '100%',
            }}
            color="orange"
            as="a"
            href="https://app.sigle.io/sigleapp.id.blockstack/h8Kxgg9_Ck6f0V-YgB7Gz"
            target="_blank"
            rel="noreferrer"
          >
            Read the rules
          </Button>
        </PenRunContainer>
      )}
    </>
  );
};
