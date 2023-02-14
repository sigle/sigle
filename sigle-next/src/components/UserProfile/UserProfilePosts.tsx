import { UserProfilePosts_postList$key } from '@/__generated__/relay/UserProfilePosts_postList.graphql';
import { graphql, usePaginationFragment } from 'react-relay';
import { StoryCardPublished } from '../StoryCard/StoryCardPublished';

export const UserProfilePosts = (props: {
  user: UserProfilePosts_postList$key;
}) => {
  const {
    data,
    hasNext,
    loadNext,
    isLoadingNext,
    hasPrevious,
    loadPrevious,
    isLoadingPrevious,
  } = usePaginationFragment(
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
      <button onClick={() => loadNext(10)}>Load</button>
    </>
  );
};
