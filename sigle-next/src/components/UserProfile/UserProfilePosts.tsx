import { graphql, usePaginationFragment } from 'react-relay';
import { useInView } from 'react-cool-inview';
import Link from 'next/link';
import { Button, Flex, LoadingSpinner, Typography } from '@sigle/ui';
import { UserProfilePosts_postList$key } from '@/__generated__/relay/UserProfilePosts_postList.graphql';
import { StoryCardPublishedGraphQL } from '../StoryCard/StoryCardPublishedGraphQL';
import { StoryCardPublishedSkeleton } from '../StoryCard/StoryCardPublishedSkeleton';

export const UserProfilePosts = (props: {
  user: UserProfilePosts_postList$key;
}) => {
  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment(
    graphql`
      fragment UserProfilePosts_postList on CeramicAccount
      @refetchable(queryName: "UserProfilePostsPaginationQuery") {
        id
        isViewer
        postList(first: $count, after: $cursor)
          @connection(key: "UserProfilePosts_postList") {
          edges {
            node {
              id
              ...StoryCardPublishedGraphQL_post
            }
          }
        }
      }
    `,
    props.user
  );

  const { observe } = useInView({
    rootMargin: '50px 0px',
    onEnter: ({ observe, unobserve }) => {
      // Pause observe when loading data
      unobserve();
      loadNext(20, {
        onComplete: () => {
          if (hasNext) {
            observe();
          }
        },
      });
    },
  });

  if (!data.postList || !data.postList.edges) return null;
  if (data.postList.edges.length === 0 && data.isViewer) {
    return (
      <>
        <Flex justify="center" direction="column" align="center">
          <Typography color="gray9" fontWeight="semiBold">
            You currently have no published stories
          </Typography>
          <Link href="/editor/new">
            <Button variant="light" size="sm" css={{ mt: '$3', mb: '$5' }}>
              Write your first story
            </Button>
          </Link>
        </Flex>
        <Flex direction="column">
          <StoryCardPublishedSkeleton animate={false} />
          <StoryCardPublishedSkeleton animate={false} />
        </Flex>
      </>
    );
  }
  if (data.postList.edges.length === 0 && !data.isViewer) {
    return (
      <Flex justify="center" direction="column">
        <Typography
          color="gray9"
          fontWeight="semiBold"
          css={{ mb: '$10', textAlign: 'center' }}
        >
          This user has no published stories yet.
        </Typography>
      </Flex>
    );
  }

  return (
    <>
      {data.postList.edges.map((edge) => {
        return (
          <StoryCardPublishedGraphQL key={edge?.node?.id} story={edge!.node!} />
        );
      })}
      <div ref={observe} />
      {isLoadingNext && (
        <Flex justify="center" mt="4">
          <LoadingSpinner />
        </Flex>
      )}
    </>
  );
};
