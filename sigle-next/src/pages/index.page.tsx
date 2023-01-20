import { graphql } from '@/gql';
import { useGraphQL } from '@/utils';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { DashboardLayout } from '../components/Dashboard/Layout';

const getPostsListQueryDocument = graphql(/* GraphQL */ `
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
`);

export default function Home() {
  // TODO SSR data fetching
  const { data, isLoading, error } = useGraphQL(getPostsListQueryDocument);

  console.log(data, isLoading, error);

  return (
    <TooltipProvider>
      <DashboardLayout> </DashboardLayout>
    </TooltipProvider>
  );
}
