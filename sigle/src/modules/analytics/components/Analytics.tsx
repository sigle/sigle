import { SubsetStory } from '../../../types';
import { Box, Flex, Heading, Text } from '../../../ui';
import { DashboardLayout } from '../../layout';
import { NftLockedView } from '../NftLockedView';
import { PublishedStoriesFrame } from '../PublishedStoriesFrame';
import { ReferrersFrame } from '../ReferrersFrame';
import { StatsFrame } from '../stats/StatsFrame';

interface AnalyticsProps {
  stories: SubsetStory[] | null;
  loading: boolean;
}

export const Analytics = ({ stories, loading }: AnalyticsProps) => {
  const nbStoriesLabel = loading ? '...' : stories ? stories.length : 0;

  return (
    <DashboardLayout layout="wide">
      <StatsFrame />
      <Box
        css={{
          display: 'flex',
          flexDirection: 'column',
          gap: '$10',
          '@xl': {
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
          },
        }}
      >
        <Box>
          <Heading as="h3" css={{ mb: '$3', fontSize: 15, fontWeight: 600 }}>
            {`My published stories (${nbStoriesLabel})`}
          </Heading>
          {stories && <PublishedStoriesFrame stories={stories} />}
        </Box>
        <ReferrersFrame />
      </Box>
    </DashboardLayout>
  );
};
