import { CheckIcon, QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { Tooltip } from '@radix-ui/themes';
import { styled } from '../../../stitches.config';
import { Box, Button, Flex, Typography } from '../../../ui';
import { sigleConfig } from '../../../config';

type PlanStatus = 'active' | 'inactive' | 'progress' | string;

interface Feature {
  name: string;
  starterPlan: PlanStatus;
  basicPlan: PlanStatus;
  publisherPlan: PlanStatus;
  info: string;
}

const features: Feature[] = [
  {
    name: 'Unlimited publishing',
    starterPlan: 'active',
    basicPlan: 'active',
    publisherPlan: 'active',
    info: 'Write as many articles as you want on Sigle, whatever the plan you choose.',
  },
  {
    name: 'Blog on app.sigle.io',
    starterPlan: 'active',
    basicPlan: 'active',
    publisherPlan: 'active',
    info: 'We create a profile page for you on app.sigle.io/yourname where your articles will be listed.',
  },
  {
    name: 'Data stored on Gaïa',
    starterPlan: 'active',
    basicPlan: 'active',
    publisherPlan: 'active',
    info: 'Gaia is an off-chain storage solution created by Stacks. All your stories are truly yours and only you can edit and delete them.',
  },
  {
    name: 'Create Ordinals',
    starterPlan: 'active',
    basicPlan: 'active',
    publisherPlan: 'active',
    info: "Inscribe your stories as Ordinals on Bitcoin, the world's most secure blockchain.",
  },
  {
    name: 'Send newsletters',
    starterPlan: 'inactive',
    basicPlan: 'active',
    publisherPlan: 'active',
    info: 'Connect your Mailjet account and start sending newsletters to your subscribers.',
  },
  {
    name: 'Privacy focused analytics',
    starterPlan: 'inactive',
    basicPlan: 'active',
    publisherPlan: 'active',
    info: "Get stats about the performance of your blog without sacrificing your user's privacy. Service provided by Plausible.",
  },
  {
    name: 'Monetize your content',
    starterPlan: 'inactive',
    basicPlan: 'progress',
    publisherPlan: 'progress',
    info: 'Connect Unlock Protocol or use Stripe and create a recurring revenue stream.',
  },
  {
    name: 'Custom domain',
    starterPlan: 'inactive',
    basicPlan: 'active',
    publisherPlan: 'active',
    info: 'Boost your SEO (100/100 Lighthouse score) with a personalized domain that truly stands out while maintaining full ownership of your content.',
  },
  {
    name: 'Page views (custom domain)',
    starterPlan: 'inactive',
    basicPlan: '2,000',
    publisherPlan: '100,000',
    info: 'This indicates the limit of views per month that your custom domain can support. Your articles will always remain visible on app.sigle.io even if the limit is reached.',
  },
  {
    name: 'Custom CSS',
    starterPlan: 'inactive',
    basicPlan: 'inactive',
    publisherPlan: 'progress',
    info: 'Create the blog of your dreams by editing the CSS of your custom domain.',
  },
  {
    name: 'Themes (custom domain)',
    starterPlan: 'inactive',
    basicPlan: '1',
    publisherPlan: '1 (more soon)',
    info: 'Choose among several themes for your custom domain.',
  },
  {
    name: 'Premium support',
    starterPlan: 'inactive',
    basicPlan: 'inactive',
    publisherPlan: 'active',
    info: 'Get fast and prioritized support on our Discord server.',
  },
];

const TableContainer = styled('div', {
  display: 'block',
  width: 20,
  right: 20,
  height: '100%',
  position: 'absolute',
  background:
    'linear-gradient(90deg, rgb(26, 26, 26, 0) 0%, rgb(26, 26, 26, 0.8) 100%)',
  zIndex: 1000,

  '@md': {
    display: 'none',
  },
});

const StyledTable = styled('table', {
  mt: '$15',
  width: '100%',
  minWidth: 700,
  overflowX: 'auto',

  '@md': {
    mt: '$5',
  },
});

const Tr = styled('tr', {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '$10',

  '&:last-of-type': {
    boxShadow: 'none',
  },
});

const Th = styled('th', {
  all: 'unset',
  color: '$gray11',
  flex: 1,
  maxWidth: '30%',
  textAlign: 'left',
});

const Td = styled('td', {
  py: '$4',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$2',
  maxWidth: '30%',
  flex: 1,
  textAlign: 'left',
});

interface TableProps {
  children: React.ReactNode;
  currentPlan: 'Starter' | 'Basic' | 'Publisher' | 'Enterprise';
}

const Table = ({ children, currentPlan }: TableProps) => (
  <StyledTable>
    <thead>
      <Tr css={{ boxShadow: '0 1px 0 0 $colors$gray12' }}>
        <Th css={{ maxWidth: 335 }} scope="col">
          <Typography css={{ fontWeight: 600 }}>Compare plans</Typography>
        </Th>
        <Th
          css={{
            display: 'flex',
            flexDirection: 'column',
            gap: '$2',
            alignItems: 'center',
            position: 'relative',
            backgroundColor: '$gray2',
            maxWidth: 220,
          }}
          scope="col"
        >
          <Box
            css={{
              borderRadius: '20px 20px 0 0',
              height: 8,
              width: '100%',
              backgroundColor: '$gray8',
            }}
          />
          <Typography size="h4" css={{ fontWeight: 600 }}>
            Starter
          </Typography>
          <Typography size="subheading" css={{ color: '$gray9' }}>
            The fundamentals
          </Typography>
          <Typography size="h4" css={{ fontWeight: 600 }}>
            Free
          </Typography>
          {currentPlan === 'Starter' && (
            <Typography
              size="subheading"
              css={{
                backgroundColor: '$green5',
                px: '$3',
                py: '$1',
                br: '$2',
              }}
            >
              Current plan
            </Typography>
          )}
        </Th>
        <Th
          css={{
            display: 'flex',
            flexDirection: 'column',
            gap: '$2',
            alignItems: 'center',
            backgroundColor: '$gray2',
            maxWidth: 220,
          }}
          scope="col"
        >
          <Box
            css={{
              borderRadius: '20px 20px 0 0',
              height: 8,
              width: '100%',
              backgroundColor: '$green11',
            }}
          />
          <Typography size="h4" css={{ fontWeight: 600 }}>
            Basic
          </Typography>
          <Typography size="subheading" css={{ color: '$gray9' }}>
            Free with 1 NFT
          </Typography>
          <Typography size="h4" css={{ fontWeight: 600 }}>
            $12/month
          </Typography>
          {currentPlan === 'Basic' ? (
            <Typography
              size="subheading"
              css={{
                backgroundColor: '$green5',
                px: '$3',
                py: '$1',
                br: '$2',
              }}
            >
              Current plan
            </Typography>
          ) : (
            <Link href={sigleConfig.gumroadUrl}>
              <Button color="green">Select this plan</Button>
            </Link>
          )}
        </Th>
        <Th
          css={{
            display: 'flex',
            flexDirection: 'column',
            gap: '$2',
            alignItems: 'center',
            backgroundColor: '$gray2',
            maxWidth: 220,
          }}
          scope="col"
        >
          <Box
            css={{
              borderRadius: '20px 20px 0 0',
              height: 8,
              width: '100%',
              backgroundColor: '$violet11',
            }}
          />
          <Typography size="h4" css={{ fontWeight: 600 }}>
            Publisher
          </Typography>
          <Typography size="subheading" css={{ color: '$gray9' }}>
            Free with 3 NFTs
          </Typography>
          <Typography size="h4" css={{ fontWeight: 600 }}>
            $29/month
          </Typography>
          {currentPlan === 'Publisher' ? (
            <Typography
              size="subheading"
              css={{
                backgroundColor: '$violet5',
                px: '$3',
                py: '$1',
                br: '$2',
              }}
            >
              Current plan
            </Typography>
          ) : (
            <Link href={sigleConfig.gumroadUrl}>
              <Button color="violet">Select this plan</Button>
            </Link>
          )}
        </Th>
      </Tr>
    </thead>
    <tbody>{children}</tbody>
  </StyledTable>
);

interface ComparePlansProps {
  currentPlan: 'Starter' | 'Basic' | 'Publisher' | 'Enterprise';
}

export const ComparePlans = ({ currentPlan }: ComparePlansProps) => {
  const getFeatureStatus = (value: PlanStatus) => {
    switch (value) {
      case 'active':
        return <CheckIcon />;
      case 'inactive':
        return '-';
      case 'progress':
        return '⚙️';
      default:
        return value;
    }
  };

  return (
    <>
      <TableContainer />

      <Table currentPlan={currentPlan}>
        {features.map((feature) => (
          <Tr
            css={{
              '&:last-of-type': {
                '& td': {
                  br: '0 0 20px 20px',
                  pb: '$8',
                },
              },
            }}
            key={feature.name}
          >
            <Th
              css={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                maxWidth: 335,
              }}
              scope="row"
            >
              <Flex gap="10" justify="between" align="center">
                <Typography size="subheading">{feature.name}</Typography>
                <Tooltip
                  delayDuration={100}
                  side="top"
                  content={feature.info}
                  className="max-w-[240px] text-center"
                >
                  <QuestionMarkCircledIcon />
                </Tooltip>
              </Flex>
            </Th>
            <Td
              css={{
                backgroundColor: '$gray2',
                '& svg': { width: 22, height: 22 },
                maxWidth: 220,
              }}
            >
              {getFeatureStatus(feature.starterPlan)}
            </Td>
            <Td
              css={{
                backgroundColor: '$gray2',
                '& svg': { width: 22, height: 22 },
                maxWidth: 220,
              }}
            >
              {getFeatureStatus(feature.basicPlan)}
            </Td>
            <Td
              css={{
                backgroundColor: '$gray2',
                '& svg': { width: 22, height: 22 },
                maxWidth: 220,
              }}
            >
              {getFeatureStatus(feature.publisherPlan)}
            </Td>
          </Tr>
        ))}
      </Table>

      <Flex
        css={{
          mt: '$5',
          gap: '$4',
          backgroundColor: '$gray2',
          position: 'relative',
          p: '$5',
          borderRadius: '0px 0px 12px 12px',
        }}
        justify="between"
        align="start"
      >
        <Box
          css={{
            borderRadius: '20px 20px 0 0',
            height: 8,
            backgroundColor: '$gray11',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        />
        <Flex direction="column">
          <Typography css={{ fontWeight: 600 }}>Enterprise</Typography>
          <Typography size="subheading" css={{ color: '$gray9', mt: '$1' }}>
            Made for large audiences
          </Typography>
          <Flex align="center" gap="4" css={{ mt: '$4' }}>
            <Typography
              size="subheading"
              css={{
                display: 'flex',
                alignItems: 'center',
                gap: '$1',
                fontWeight: 600,
              }}
            >
              <CheckIcon />
              Everything in Publisher
            </Typography>
            <Typography
              size="subheading"
              css={{ display: 'flex', alignItems: 'center', gap: '$1' }}
            >
              <CheckIcon />
              100,000+ page views (custom domain)
            </Typography>
          </Flex>
        </Flex>
        <Link href={'mailto:hello@sigle.io?subject=Sigle enterprise plan'}>
          <Button>Contact us</Button>
        </Link>
      </Flex>
    </>
  );
};
