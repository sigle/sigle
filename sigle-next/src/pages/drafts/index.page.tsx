import { TooltipProvider } from '@radix-ui/react-tooltip';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { Container, Typography } from '@sigle/ui';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { draftsPostsListQuery } from '@/__generated__/relay/draftsPostsListQuery.graphql';
import { StoryCardDraft } from '@/components/StoryCard/StoryCardDraft';

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
            ...StoryCardDraft_post
          }
        }
      }
    }
  }
`;

const Drafts = () => {
  const data = useLazyLoadQuery<draftsPostsListQuery>(DraftsPostsListQuery, {});

  return (
    <DashboardLayout
      sidebarContent={
        <>
          <Typography size="lg" fontWeight="bold">
            Recommended
          </Typography>
        </>
      }
    >
      <Container css={{ maxWidth: 680, py: '$5' }}>
        {data.viewer?.postList?.edges?.map((node) => (
          <StoryCardDraft key={node?.node?.id} story={node!.node!} />
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
