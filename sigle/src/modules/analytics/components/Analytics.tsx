import { SubsetStory } from '../../../types';
import { Box, Flex, Heading, Text } from '../../../ui';
import { DashboardLayout } from '../../layout';
import { PublishedStoriesFrame } from '../PublishedStoriesFrame';
import { ReferrersFrame } from '../ReferrersFrame';

interface AnalyticsProps {
  stories: SubsetStory[] | null;
  loading: boolean;
}

export const Analytics = ({ stories, loading }: AnalyticsProps) => {
  const nbStoriesLabel = loading ? '...' : stories ? stories.length : 0;

  return (
    <DashboardLayout layout="wide">
      <Box
        css={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '$10' }}
      >
        <Box>
          <Heading as="h3" css={{ mb: '$3', fontSize: 15, fontWeight: 600 }}>
            {`My published stories (${nbStoriesLabel})`}
          </Heading>
          {stories && <PublishedStoriesFrame stories={stories} />}
        </Box>
        <Box css={{ flexGrow: 1 }}>
          <Flex css={{ mb: '$5' }} justify="between">
            <Heading as="h3" css={{ fontSize: 15, fontWeight: 600 }}>
              Referrers
            </Heading>
            <Heading as="h3" css={{ fontSize: 15, fontWeight: 600 }}>
              Views
            </Heading>
          </Flex>
          <ReferrersFrame />
        </Box>
      </Box>
    </DashboardLayout>
  );
};
