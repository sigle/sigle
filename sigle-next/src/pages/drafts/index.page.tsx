import { useQuery } from '@tanstack/react-query';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { graphql } from '@/gql';
import { composeClient } from '@/utils';
import { DashboardLayout } from '@/components/Dashboard/Layout';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { Badge, Container, Flex, Typography } from '@sigle/ui';

const getPostsListQuery = /* GraphQL */ `
  query getPostsList {
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
    <Flex direction="column">
      <Typography size="lg">
        The NFT Standard will be become the primary protocol for transacting
        Digital Art
      </Typography>
      <Typography size="sm" color="gray9" css={{ mt: '$2' }}>
        Blockchain has completely changed the way we think about money and
        created a true era of digital property. Bitcoin is the first successful
        use case for blockchain. Some creative developers believe...
      </Typography>
      <Flex justify="between" css={{ mt: '$9' }}>
        <Typography size="xs" color="gray9">
          Feb 18, 2023 at 11:46am
        </Typography>
        {/* TODO create Label component */}
        <Badge>DRAFT</Badge>
      </Flex>
    </Flex>
  );
};

const Drafts = () => {
  const { data, isLoading, error } = useQuery(['getPostsList'], () =>
    composeClient.executeQuery(getPostsListQuery)
  );

  console.log(data, isLoading, error);

  return (
    <Container css={{ maxWidth: 680 }}>
      {data?.data.viewer.postList.edges.map((node) => (
        <StoryCard key={node.node.id} story={node.node} />
      ))}
    </Container>
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
