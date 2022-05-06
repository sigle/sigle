import { SubsetStory } from '../../../types';
import { Heading, Text } from '../../../ui';
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
      <Heading as="h3" css={{ mb: '$3', fontSize: 15, fontWeight: 600 }}>
        {`My published stories (${nbStoriesLabel})`}
      </Heading>
      {stories && <PublishedStoriesFrame stories={stories} />}
    </DashboardLayout>
  );
};
