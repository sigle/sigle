import { TooltipProvider } from '@radix-ui/react-tooltip';
import { TbDots } from 'react-icons/tb';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { Badge, Container, Flex, IconButton, Typography } from '@sigle/ui';
import { draftsPostsListQuery } from '@/__generated__/relay/draftsPostsListQuery.graphql';

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

const Drafts = () => {
  const data = useLazyLoadQuery<draftsPostsListQuery>(DraftsPostsListQuery, {});

  return (
    <DashboardLayout
      sidebarContent={
        <>
          <Typography size="lg" fontWeight="bold">
            Recommended
          </Typography>
          {data.viewer?.postList?.edges?.map((node) => (
            <StoryCard key={node?.node?.id} story={node?.node!} />
          ))}
        </>
      }
    >
      <Container css={{ maxWidth: 680, py: '$5' }}>
        {data.viewer?.postList?.edges?.map((node) => (
          <StoryCard key={node?.node?.id} story={node?.node!} />
        ))}
      </Container>
    </DashboardLayout>
  );
};

export default function ProtectedDrafts() {
  // TODO auth protect
  const { session } = useCeramic();

  return <TooltipProvider>{session ? <Drafts /> : null}</TooltipProvider>;
}
