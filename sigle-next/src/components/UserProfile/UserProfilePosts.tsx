import { graphql, usePaginationFragment } from 'react-relay';
import { useInView } from 'react-cool-inview';
import { Flex, LoadingSpinner } from '@sigle/ui';
import { UserProfilePosts_postList$key } from '@/__generated__/relay/UserProfilePosts_postList.graphql';
import { StoryCardPublished } from '../StoryCard/StoryCardPublished';

export const UserProfilePosts = (props: {
  user: UserProfilePosts_postList$key;
}) => {
  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment(
    graphql`
      fragment UserProfilePosts_postList on CeramicAccount
      @refetchable(queryName: "UserProfilePostsPaginationQuery") {
        postList(first: $count, after: $cursor)
          @connection(key: "UserProfilePosts_postList") {
          edges {
            node {
              id
              ...StoryCardPublished_post
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
      loadNext(5, {
        onComplete: () => {
          if (hasNext) {
            observe();
          }
        },
      });
    },
  });

  if (!data.postList || !data.postList.edges) return null;

  return (
    <>
      {data.postList.edges.map((edge) => {
        return (
          <StoryCardPublished
            key={edge?.node?.id}
            did={data!.id}
            story={edge!.node!}
          />
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
