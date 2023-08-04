import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useGetUserSubscription } from '../../../hooks/subscriptions';
import { getStoriesFile } from '../../../utils';
import { DashboardLayout } from '../../layout';
import { Analytics as Component } from '../components/Analytics';
import { NftLockedView } from '../NftLockedView';

export const Analytics = () => {
  const { isLoading, data: userSubscription } = useGetUserSubscription();
  const { isLoading: isStoriesLoading, data: stories } = useQuery(
    ['get-user-stories'],
    async () => {
      const file = await getStoriesFile();
      const fileStories = file.stories.filter((s) => s.type === 'public');
      return fileStories;
    },
    {
      onError: (error: Error) => {
        console.error(error);
        toast.error(error.message);
      },
    },
  );

  if (isLoading) {
    return <DashboardLayout layout="wide">Loading...</DashboardLayout>;
  }

  if (!isLoading && !userSubscription) {
    return (
      <DashboardLayout>
        <NftLockedView />
      </DashboardLayout>
    );
  }

  return <Component loading={isStoriesLoading} stories={stories} />;
};
