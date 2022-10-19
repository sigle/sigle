import {
  ArrowLeftIcon,
  CheckIcon,
  QuestionMarkCircledIcon,
} from '@radix-ui/react-icons';
import Link from 'next/link';
import { Dispatch, SetStateAction, useState } from 'react';
import { useGetUserSubscription } from '../../../hooks/subscriptions';
import { styled } from '../../../stitches.config';
import {
  Box,
  Button,
  Flex,
  LoadingSpinner,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Typography,
} from '../../../ui';
import { SettingsLayout } from '../SettingsLayout';
import { SelectNFTDialog } from './SelectNFTDialog';

type PlanStatus = 'active' | 'inactive' | 'progress';

interface Feature {
  name: string;
  starterPlan: PlanStatus;
  creatorPlan: PlanStatus;
  info: string;
}

const features: Feature[] = [
  {
    name: 'Write unlimited stories',
    starterPlan: 'active',
    creatorPlan: 'active',
    info: 'On Sigle, you can write as many stories as you want, whatever plan you choose.',
  },
  {
    name: 'Data stored on Gaïa',
    starterPlan: 'active',
    creatorPlan: 'active',
    info: 'Gaia is an off-chain storage solution. All your stories are truly yours and only you can edit and delete them.',
  },
  {
    name: 'Analytics',
    starterPlan: 'inactive',
    creatorPlan: 'active',
    info: 'In-depth analysis of your stories to maximize your views and visits on your blog.',
  },
  {
    name: 'Monetise your stories',
    starterPlan: 'progress',
    creatorPlan: 'progress',
    info: 'Get subscribers, monetise your stories and newsletters in crypto or fiat.',
  },
  {
    name: 'Send newsletters',
    starterPlan: 'progress',
    creatorPlan: 'progress',
    info: 'Create your community on web3 and send newsletters (paid or free) to your subscribers!',
  },
  {
    name: 'Get featured in the Discover page',
    starterPlan: 'inactive',
    creatorPlan: 'progress',
    info: 'Grow your community faster by reaching more people on the Discover page.',
  },
  {
    name: 'Create NFT gating for your stories',
    starterPlan: 'inactive',
    creatorPlan: 'progress',
    info: 'Give your community access to your paid stories with your own NFT collection!',
  },
  {
    name: 'Personal domain',
    starterPlan: 'inactive',
    creatorPlan: 'progress',
    info: 'Use your own domain to match your brand and make your blog stand out.',
  },
  {
    name: 'Access community Discord channel & special giveaway',
    starterPlan: 'inactive',
    creatorPlan: 'active',
    info: 'Explorer Guild NFT holders can access the community chat and many giveaways from our partners on Discord.',
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
  setIsSelectNFTDialogOpen: Dispatch<SetStateAction<boolean>>;
  activeSubscription?: boolean;
}

const Table = ({
  children,
  setIsSelectNFTDialogOpen,
  activeSubscription,
}: TableProps) => (
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
              backgroundColor: '$gray11',
            }}
          />
          <Typography size="h4" css={{ fontWeight: 600 }}>
            Starter
          </Typography>
          <Typography size="subheading" css={{ color: '$gray9' }}>
            All the basic
          </Typography>
          <Typography size="h4" css={{ fontWeight: 600 }}>
            Free
          </Typography>
          {!activeSubscription && (
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
              backgroundColor: '$violet11',
            }}
          />
          <Typography size="h4" css={{ fontWeight: 600 }}>
            Creator +
          </Typography>
          <Typography size="subheading" css={{ color: '$gray9' }}>
            Unlock with your NFT
          </Typography>
          <Typography size="h4" css={{ fontWeight: 600 }}>
            Free
          </Typography>
          {!activeSubscription ? (
            <Button
              onClick={() => setIsSelectNFTDialogOpen(true)}
              size="lg"
              color="violet"
              css={{ width: 'calc(100% - $6)' }}
            >
              Link your NFT
            </Button>
          ) : (
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
      </Tr>
    </thead>
    <tbody>{children}</tbody>
  </StyledTable>
);

export const ComparePlans = () => {
  const { data: subscriptionData, isLoading } = useGetUserSubscription();
  const [isSelectNFTDialogOpen, setIsSelectNFTDialogOpen] = useState(false);

  const getFeatureStatus = (value: PlanStatus) => {
    switch (value) {
      case 'active':
        return <CheckIcon />;
      case 'inactive':
        return null;
      case 'progress':
        return '⚙️';
      default:
        throw new Error('No value received.');
    }
  };

  return (
    <SettingsLayout>
      <TableContainer />
      <Link href="/settings/plans">
        <Button
          css={{
            gap: '$2',
            cursor: 'pointer',
            position: 'absolute',
            '@md': { position: 'relative' },
          }}
          variant="subtle"
          as="a"
        >
          <ArrowLeftIcon />
          Go back to your current plan
        </Button>
      </Link>

      {isLoading ? (
        <Box css={{ py: '$10' }}>
          <LoadingSpinner />
        </Box>
      ) : null}

      {!isLoading ? (
        <Table
          activeSubscription={!!subscriptionData}
          setIsSelectNFTDialogOpen={setIsSelectNFTDialogOpen}
        >
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
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger>
                      <QuestionMarkCircledIcon />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      sideOffset={4}
                      css={{
                        textAlign: 'center',
                        boxShadow: 'none',
                        width: 240,
                      }}
                    >
                      {feature.info}
                    </TooltipContent>
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
                  '& svg': { width: 22, height: 22, color: '$violet11' },
                  maxWidth: 220,
                }}
              >
                {getFeatureStatus(feature.creatorPlan)}
              </Td>
            </Tr>
          ))}
        </Table>
      ) : null}

      <SelectNFTDialog
        open={isSelectNFTDialogOpen}
        onOpenChange={() => setIsSelectNFTDialogOpen(false)}
      />
    </SettingsLayout>
  );
};
