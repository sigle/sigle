import { StoryItemAnalytics } from '../../modules/analytics/containers/StoryItemAnalytics';
import { Protected } from '../../modules/auth/Protected';

export const StoryAnalyticsPage = () => {
  return (
    <Protected>
      <StoryItemAnalytics />
    </Protected>
  );
};

export default StoryAnalyticsPage;
