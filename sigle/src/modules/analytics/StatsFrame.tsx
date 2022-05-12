import { Box, Flex, Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui';

export const StatsFrame = () => {
  return (
    <Box css={{ mb: '$8' }}>
      <Flex css={{ position: 'relative' }}>
        <Tabs css={{ width: '100%' }} defaultValue="weekly">
          <TabsList
            css={{ alignSelf: 'end' }}
            aria-label="See your total views and visitors"
          >
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          <TabsContent value="weekly">Weekly</TabsContent>
          <TabsContent value="monthly">Monthly</TabsContent>
          <TabsContent value="all">All</TabsContent>
        </Tabs>
      </Flex>
    </Box>
  );
};
