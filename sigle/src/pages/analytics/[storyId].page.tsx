import { GetServerSideProps } from 'next';
import { StoryItemAnalytics } from '../../modules/analytics/containers/StoryItemAnalytics';

interface StoryAnalyticsPageProps {
  storyId: string;
}

export const StoryAnalyticsPage = ({ storyId }: StoryAnalyticsPageProps) => {
  return <StoryItemAnalytics storyId={storyId} />;
};

export const getServerSideProps: GetServerSideProps<
  StoryAnalyticsPageProps
> = async ({ params }) => {
  const storyId = params?.storyId as string;
  return { props: { storyId } };
};

export default StoryAnalyticsPage;
