interface PublicStoryRouteParams {
  username: string;
  storyId: string;
}

export const getPublicStoryRoute = ({
  username,
  storyId,
}: PublicStoryRouteParams) => ({
  href: {
    pathname: '/story',
    query: { username, storyId },
  },
  as: `/@${username}/${storyId}`,
});

interface ProfileRouteParams {
  username: string;
}

export const getProfileRoute = ({ username }: ProfileRouteParams) => ({
  href: {
    pathname: '/profile',
    query: { username },
  },
  as: `/@${username}`,
});

interface EditorRouteParams {
  storyId: string;
  radiksType: 'PrivateStory' | 'PublicStory';
}

export const getEditorRoute = ({ storyId, radiksType }: EditorRouteParams) => ({
  href: {
    pathname: '/editor',
    query: {
      storyId,
      storyType: radiksType === 'PrivateStory' ? 'private' : undefined,
    },
  },
  as:
    radiksType === 'PrivateStory'
      ? `/me/stories/drafts/${storyId}`
      : `/me/stories/${storyId}`,
});
