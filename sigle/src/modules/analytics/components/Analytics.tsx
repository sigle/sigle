import { SubsetStory } from '../../../types';
import { Text } from '../../../ui';
import { DashboardLayout } from '../../layout';
import { PublishedStoriesFrame } from '../PublishedStoriesFrame';

interface AnalyticsProps {
  stories: SubsetStory[] | null;
  loading: boolean;
}

export const Analytics = ({ stories, loading }: AnalyticsProps) => {
  const nbStoriesLabel = loading ? '...' : stories ? stories.length : 0;

  return (
    <DashboardLayout>
      <Text as="h3" size="sm" css={{ mb: '$3', fontWeight: 600 }}>
        {`My published stories (${nbStoriesLabel})`}
      </Text>
      {stories && <PublishedStoriesFrame stories={stories} />}
    </DashboardLayout>
  );
};
