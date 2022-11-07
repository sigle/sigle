import Link from 'next/link';
import { useEffect, useState } from 'react';
import { sigleConfig } from '../../../config';
import {
  useGetDismissableFlags,
  useUpdateDismissableFlags,
} from '../../../hooks/appData';
import { styled } from '../../../stitches.config';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Box,
  Button,
  Flex,
  Typography,
} from '../../../ui';
import { Progress, ProgressIndicator } from '../../../ui/Progress';
import { DismissableFlags } from '../../../utils';

interface Checklist {
  title: string;
  description: string | React.ReactNode;
  cta?: { type: 'Button' | 'Link'; label: string; href?: string };
}

const checklist: Checklist[] = [
  {
    title: 'Set up your profile',
    description: (
      <Box as="span" css={{ lineHeight: 1.5 }}>
        Go to the settings and choose a name (you can be anonymous), your
        profile picture and your description. Add your email to receive updates
        and subscribe faster to other writers.
      </Box>
    ),
    cta: {
      type: 'Link',
      label: 'Go to settings',
      href: '/settings',
    },
  },
  {
    title: 'Add an email',
    description:
      'Add your email to receive updates and subscribe faster to other writers (coming soon).',
    cta: {
      type: 'Link',
      label: 'Add my email',
      // need to update once we have the href
      href: '#',
    },
  },
  {
    title: 'Write your first story',
    description: (
      <Box as="span" css={{ lineHeight: 1.5 }}>
        Choose a title and a cover image and let your imagination run wild!{' '}
        <br />
        When you're done, adjust the metadata in the editor settings and save.{' '}
        <br />
        Your story will remain private as long as it is in your drafts.
      </Box>
    ),
    cta: {
      type: 'Button',
      label: 'Write a story',
    },
  },
  {
    title: 'Publish and share it with the world',
    description: (
      <Box as="span" css={{ lineHeight: 2 }}>
        Are you happy with your writing? Click <em>Publish</em> on the editor.{' '}
        <br />
        Now, your story is in the <em>Published</em> section. Anyone who goes to
        your profile will be able to read your story. <br />
        To share your story, find it on your blog and click on the social
        network icons, or simply copy/paste the link.
      </Box>
    ),
  },
  {
    title: 'Explore and build a feed that suits you',
    description: (
      <Box as="span" css={{ lineHeight: 2 }}>
        Go to the <em>Explore</em> page to discover hundreds of passionate
        writers. Follow the one you love and build your personalised feed.
      </Box>
    ),
    cta: {
      type: 'Link',
      label: 'Explore',
      href: '/explore',
    },
  },
  {
    title: 'Access premium features',
    description: (
      <Box as="span" css={{ lineHeight: 2 }}>
        Writing on Sigle is free, but you can unlock premium features with an
        NFT: <br />
        ✅ Analytics page <br />
        ⚙️ Newsletters <br />
        ⚙️ Monetisation (write & earn) <br />
        ⚙️ Publish on Discover page <br />
        ⚙️ Domain name <br />
        ⚙️ And more… <br />
        Unlock the Creator plan with your Explorer Guild NFT!
      </Box>
    ),
    cta: {
      type: 'Link',
      label: 'Get an Explorer Guild NFT',
      href: sigleConfig.gammaUrl,
    },
  },
];

const OnboardingContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '$gray2',
  width: '100%',
  mt: '$10',
  py: '$8',
  px: '$5',
  gap: '$5',
  br: '$4',
});

export const OnboardingChecklist = () => {
  const [progress, setProgress] = useState(0);
  const { data: flags } = useGetDismissableFlags();
  const { mutate: hideChecklist } = useUpdateDismissableFlags();

  useEffect(() => {
    const timer = setTimeout(() => setProgress(20), 250);
    return () => clearTimeout(timer);
  }, []);

  const onboarding = DismissableFlags.onboarding;

  const handleHideChecklist = () =>
    hideChecklist({ dismissableFlag: onboarding });

  return (
    <>
      {!flags?.onboarding ? (
        <OnboardingContainer>
          <Flex gap="1" direction="column">
            <Typography css={{ fontWeight: 600 }} size="h4">
              Welcome
            </Typography>
            <Typography size="subheading">
              Complete this checklist to properly get started on Sigle
            </Typography>
            <Flex align="center" gap="1">
              <Typography css={{ color: '$green11' }} size="subheading">
                2/5
              </Typography>
              <Progress value={20}>
                <ProgressIndicator
                  css={{ transform: `translateX(-${100 - progress}%)` }}
                />
              </Progress>
            </Flex>
            <Accordion collapsible type="single" css={{ mt: '$10', mb: 0 }}>
              {checklist.map((item, index) => (
                <AccordionItem key={item.title} value={item.title}>
                  <AccordionTrigger>
                    <Flex align="center" gap="3">
                      <Typography css={{ color: '$gray9' }} size="h4">
                        {index + 1}
                      </Typography>
                      <Typography size="subheading">{item.title}</Typography>
                    </Flex>
                  </AccordionTrigger>
                  <AccordionContent css={{ mt: '$5', px: '$3' }}>
                    <Flex css={{ mb: '$5' }} direction="column" gap="5">
                      <Typography css={{ color: '$gray9' }} size="subheading">
                        {item.description}
                      </Typography>
                      {item.cta?.type === 'Button' && (
                        <Button
                          css={{ alignSelf: 'start' }}
                          size="lg"
                          onClick={() => console.log('fired')}
                        >
                          {item.cta.label}
                        </Button>
                      )}
                      {item.cta?.href && item.cta?.type === 'Link' && (
                        <Link href={item.cta.href} passHref>
                          {item.cta?.href.includes('https') ? (
                            <Button
                              css={{ alignSelf: 'start' }}
                              target="_blank"
                              rel="noreferrer"
                              as="a"
                              size="lg"
                            >
                              {item.cta.label}
                            </Button>
                          ) : (
                            <Button
                              css={{ alignSelf: 'start' }}
                              as="a"
                              size="lg"
                            >
                              {item.cta.label}
                            </Button>
                          )}
                        </Link>
                      )}
                    </Flex>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Button
              onClick={handleHideChecklist}
              variant="ghost"
              css={{
                alignSelf: 'center',
                color: '$gray11',
                mt: '$3',
                textDecoration: 'underline',
                textAlign: 'center',
              }}
            >
              I don’t want to see this checklist again
            </Button>
          </Flex>
        </OnboardingContainer>
      ) : null}
    </>
  );
};
