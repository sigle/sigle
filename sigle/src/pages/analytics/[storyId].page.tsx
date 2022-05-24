import { GetServerSideProps } from 'next';
import { StoryAnalytics } from '../../modules/analytics/StoryAnalytics';

interface StoryAnalyticsPageProps {
  storyId: string;
}

export const StoryAnalyticsPage = ({ storyId }: StoryAnalyticsPageProps) => {
  return <StoryAnalytics storyId={storyId} />;
};

export const getServerSideProps: GetServerSideProps<
  StoryAnalyticsPageProps
> = async ({ params }) => {
  const storyId = params?.storyId as string;
  return { props: { storyId } };
};

export default StoryAnalyticsPage;
