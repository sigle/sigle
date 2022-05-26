import { stagger } from 'motion';
import { useMotionAnimate } from 'motion-hooks';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { Box, Flex, Text } from '../../ui';
import { Pagination } from './Pagination';
import { ReferrersItemProps, ReferrersResponse } from './stats/types';

const FATHOM_MAX_FROM_DATE = '2021-04-01';

const fetchReferrers = async () => {
  const url = `http://localhost:3001/api/analytics/referrers?dateFrom=${FATHOM_MAX_FROM_DATE}`;

  const statsRes = await fetch(url);
  const referrerData: ReferrersResponse = await statsRes.json();
  console.log(referrerData);
  return referrerData;
};

export const ReferrersFrame = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { data: referrers } = useQuery<ReferrersResponse, Error>(
    ['fetchReferrers'],
    fetchReferrers
  );
  const { play } = useMotionAnimate(
    '.referrer-item',
    { opacity: 1 },
    {
      delay: stagger(0.075),
      duration: 0.5,
      easing: 'ease-in-out',
    }
  );

  useEffect(() => {
    play();
  }, [currentPage]);

  // amount of referres per page
  let itemSize = 10;

  const currentReferrers = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * itemSize;
    const lastPageIndex = firstPageIndex + itemSize;
    return referrers?.slice(firstPageIndex, lastPageIndex);
  }, [currentPage]);

  const currentReferrerLastItem =
    currentReferrers && currentReferrers[currentReferrers.length - 1];

  const referrerLastItem = referrers && referrers[referrers.length - 1];

  const hasNextPage =
    currentReferrerLastItem === referrerLastItem ? false : true;

  const total = referrers
    ? referrers.map((item) => item.count).reduce((a, b) => a + b)
    : 0;

  const getPercentage = (views: number) => {
    const percentage = Math.round((100 * views) / total);
    const lessThanTenPercent = percentage < 10;
    // clamp min value to 10% - see https://github.com/sigle/sigle/issues/451 for context
    return lessThanTenPercent ? percentage + 10 : percentage;
  };

  return (
    <>
      {currentReferrers ? (
        <Flex
          css={{ flexShrink: 0, mb: '$4', height: 464 }}
          direction="column"
          gap="5"
        >
          {currentReferrers.map((referrer) => (
            <Flex
              className="referrer-item"
              css={{ opacity: 0 }}
              key={referrer.domain}
              gap="5"
              justify="between"
              align="center"
            >
              <Box
                css={{
                  flex: 1,
                }}
              >
                <Box
                  css={{
                    p: '$1',
                    br: '$1',
                    backgroundColor: '$gray3',
                    width: `${getPercentage(referrer.count)}%`,
                  }}
                >
                  <Text size="sm">{referrer.domain}</Text>
                </Box>
              </Box>
              <Text size="sm">{referrer.count}</Text>
            </Flex>
          ))}
        </Flex>
      ) : (
        <Box css={{ display: 'grid', placeItems: 'center', height: '100%' }}>
          <Text>No data to display</Text>
        </Box>
      )}
      <Pagination
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
        hasNextPage={hasNextPage}
      />
    </>
  );
};
