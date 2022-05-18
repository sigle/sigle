import { useEffect } from 'react';
import {
  Box,
  Flex,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../ui';
import { StatsAll } from './StatsAll';
import { StatsMonthly } from './StatsMonthly';
import { StatsWeekly } from './StatsWeekly';

export const StatsFrame = () => {
  return (
    <Box css={{ mb: '$8' }}>
      <Flex>
        <Tabs css={{ width: '100%' }} defaultValue="weekly">
          <TabsList
            css={{ alignSelf: 'end' }}
            aria-label="See your total views and visitors"
          >
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          <TabsContent value="weekly">
            <Box
              css={{
                mb: '$5',
                position: 'relative',
                width: '100%',
                height: 400,
              }}
            >
              <StatsWeekly />
            </Box>
          </TabsContent>
          <TabsContent value="monthly">
            <Box
              css={{
                mb: '$5',
                position: 'relative',
                width: '100%',
                height: 400,
              }}
            >
              <StatsMonthly />
            </Box>
          </TabsContent>
          <TabsContent value="all">
            <Box
              css={{
                mb: '$5',
                position: 'relative',
                width: '100%',
                height: 400,
              }}
            >
              <StatsAll />
            </Box>
          </TabsContent>
        </Tabs>
      </Flex>
    </Box>
  );
};
