import {
  ArrowLeftIcon,
  CheckIcon,
  QuestionMarkCircledIcon,
} from '@radix-ui/react-icons';
import Link from 'next/link';
import { styled } from '../../../stitches.config';
import {
  Box,
  Button,
  Flex,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Typography,
} from '../../../ui';
import { SettingsLayout } from '../SettingsLayout';

type PlanStatus = 'active' | 'inactive' | 'progress';

interface Feature {
  name: string;
  starterPlan: PlanStatus;
  creatorPlan: PlanStatus;
}

const features: Feature[] = [
  {
    name: 'Write unlimited stories',
    starterPlan: 'active',
    creatorPlan: 'active',
  },
  {
    name: 'Data stored on Gaïa',
    starterPlan: 'active',
    creatorPlan: 'active',
  },
  {
    name: 'Analytics',
    starterPlan: 'inactive',
    creatorPlan: 'active',
  },
  {
    name: 'Monetise your stories',
    starterPlan: 'progress',
    creatorPlan: 'progress',
  },
  {
    name: 'Send newsletters',
    starterPlan: 'progress',
    creatorPlan: 'progress',
  },
  {
    name: 'Get named in the Discover page',
    starterPlan: 'inactive',
    creatorPlan: 'progress',
  },
  {
    name: 'Create NFT gating for your stories',
    starterPlan: 'inactive',
    creatorPlan: 'progress',
  },
  {
    name: 'Personal domain',
    starterPlan: 'inactive',
    creatorPlan: 'progress',
  },
  {
    name: 'Access community Discord channel & special giveaway',
    starterPlan: 'inactive',
    creatorPlan: 'progress',
  },
];

const StyledTable = styled('table', {
  mt: '$5',
  width: '100%',
});

const Tr = styled('tr', {
  display: 'flex',
  justifyContent: 'space-between',

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
  py: '$8',
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
}

const Table = ({ children }: TableProps) => (
  <StyledTable>
    <thead>
      <Tr css={{ boxShadow: '0 1px 0 0 $colors$gray12' }}>
        <Th scope="col">
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
          <Typography
            size="subheading"
            css={{ backgroundColor: '$green5', px: '$3', py: '$1', br: '$2' }}
          >
            Current plan
          </Typography>
        </Th>
        <Th
          css={{
            display: 'flex',
            flexDirection: 'column',
            gap: '$2',
            alignItems: 'center',
            backgroundColor: '$gray2',
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
          <Button size="lg" color="violet">
            Link your NFT
          </Button>
        </Th>
      </Tr>
    </thead>
    <tbody>{children}</tbody>
  </StyledTable>
);

export const ComparePlans = () => {
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
      <Link href="/settings/plans">
        <Button css={{ gap: '$2', cursor: 'pointer' }} variant="subtle" as="a">
          <ArrowLeftIcon />
          Go back to your current plan
        </Button>
      </Link>
      <Table>
        {features.map((feature) => (
          <Tr
            css={{
              '&:last-of-type': {
                '& td': {
                  br: '0 0 20px 20px',
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
              }}
              scope="row"
            >
              <Flex justify="between" align="center">
                <Typography size="subheading">{feature.name}</Typography>
                <Tooltip>
                  <TooltipTrigger>
                    <QuestionMarkCircledIcon />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    sideOffset={4}
                    css={{
                      textAlign: 'center',
                      boxShadow: 'none',
                      backgroundColor: '$gray10',
                      color: '$gray2',
                      width: 240,
                    }}
                  >
                    On Sigle, you can write as many stories as you want,
                    whatever plan you choose.
                  </TooltipContent>
                </Tooltip>
              </Flex>
            </Th>
            <Td
              css={{
                backgroundColor: '$gray2',
                '& svg': { width: 22, height: 22 },
              }}
            >
              {getFeatureStatus(feature.starterPlan)}
            </Td>
            <Td
              css={{
                backgroundColor: '$gray2',
                '& svg': { width: 22, height: 22, color: '$violet11' },
              }}
            >
              {getFeatureStatus(feature.creatorPlan)}
            </Td>
          </Tr>
        ))}
      </Table>
    </SettingsLayout>
  );
};
