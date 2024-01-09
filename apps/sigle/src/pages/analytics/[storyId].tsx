import { StoryItemAnalytics } from '../../modules/analytics/containers/StoryItemAnalytics';
import { Protected } from '../../components/authentication/protected';

export const StoryAnalyticsPage = () => {
  return (
    <Protected>
      <StoryItemAnalytics />
    </Protected>
  );
};

export default StoryAnalyticsPage;
