import { useQuery } from '@tanstack/react-query';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { TbDots } from 'react-icons/tb';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { Badge, Container, Flex, IconButton, Typography } from '@sigle/ui';
import { DashboardContent } from '@/components/Dashboard/DashboardContent';
import { styled } from '@sigle/stitches.config';
import { draftsPostsListQuery } from '@/graphql/__generated__/draftsPostsListQuery.graphql';

const DraftsPostsListQuery = graphql`
  query draftsPostsListQuery {
    viewer {
      id
      postList(first: 10) {
        pageInfo {
          hasNextPage
          hasNextPage
          startCursor
          endCursor
        }
        edges {
          node {
            id
            title
            version
          }
        }
      }
    }
  }
`;

interface StoryCardProps {
  story: {
    title: string;
  };
}

const StoryCard = ({ story }: StoryCardProps) => {
  return (
    <Flex
      direction="column"
      css={{
        borderTop: '1px solid $gray6',
        py: '$6',
        '&:first-child': {
          borderTop: 'none',
        },
      }}
    >
      <Typography size="lg" fontWeight="bold" lineClamp={2}>
        The NFT The NFT Standard will become the primary protocol for
        transacting Digital Art Digital Art
      </Typography>
      <Typography size="sm" color="gray9" css={{ mt: '$2' }} lineClamp={3}>
        Blockchain has completely changed the way we think about money and
        created a true era of digital property. Bitcoin is the first successful
        use case for blockchain. Some creative developers believe Bitcoin is the
        first successful use case for blockchain. Some creative developers
        believe Bitcoin is the first successful use case for blockchain.
      </Typography>
      <Flex justify="between" align="center" css={{ mt: '$9' }}>
        <Typography size="xs" color="gray9">
          Feb 18, 2023 at 11:46am
        </Typography>
        <Flex align="center" gap="2">
          <Badge>DRAFT</Badge>
          <IconButton size="xs" variant="ghost">
            <TbDots />
          </IconButton>
        </Flex>
      </Flex>
    </Flex>
  );
};

const Box = styled('div', {});

const Drafts = () => {
  // const { data, isLoading, error } = useQuery(['getPostsList'], () =>
  //   composeClient.executeQuery(getPostsListQuery)
  // );

  const data = useLazyLoadQuery<draftsPostsListQuery>(DraftsPostsListQuery, {});

  return (
    <DashboardContent>
      <Box
        css={{
          display: 'grid',
          gridTemplateColumns: '1fr 420px',
        }}
      >
        <div>
          <Container css={{ maxWidth: 680 }}>
            {data.viewer?.postList?.edges?.map((node) => (
              <StoryCard key={node?.node?.id} story={node?.node!} />
            ))}
          </Container>
        </div>
        <Box css={{ position: 'relative', borderLeft: '1px solid $gray6' }}>
          <Box
            css={{
              py: '$5',
              px: '$5',
              overflowY: 'scroll',
              position: 'fixed',
              top: 80,
              bottom: 0,
            }}
          >
            <Typography size="lg" fontWeight="bold">
              Recommended
            </Typography>
            {data.viewer?.postList?.edges?.map((node) => (
              <StoryCard key={node?.node?.id} story={node?.node!} />
            ))}
          </Box>
        </Box>
      </Box>
    </DashboardContent>
  );
};

export default function ProtectedDrafts() {
  const { session } = useCeramic();

  return (
    <TooltipProvider>
      <DashboardLayout>{session ? <Drafts /> : null}</DashboardLayout>
    </TooltipProvider>
  );
}
