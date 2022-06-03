import { stagger } from 'motion';
import { useMotionAnimate } from 'motion-hooks';
import { useEffect, useMemo, useState } from 'react';
import { useGetReferrers } from '../../hooks/analytics';
import { Box, Flex, Typography } from '../../ui';
import { Pagination } from './Pagination';
import { StatsError } from './stats/StatsError';

export const ReferrersFrame = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { data: referrers, isError, error } = useGetReferrers();
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
    <Flex direction="column" justify="between">
      <Flex css={{ mb: '$5' }} justify="between">
        <Typography
          as="h3"
          size="subheading"
          css={{ fontWeight: 600, color: '$gray11' }}
        >
          Referrers
        </Typography>
        <Typography
          as="h3"
          size="subheading"
          css={{ fontWeight: 600, color: '$gray11' }}
        >
          Views
        </Typography>
      </Flex>
      {isError && <StatsError>{error.message}</StatsError>}
      {currentReferrers ? (
        <Flex
          css={{ flexShrink: 0, mb: '$4', height: 476 }}
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
                  position: 'relative',
                  p: '$1',
                  br: '$1',
                }}
              >
                <Box
                  css={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    zIndex: -1,
                    backgroundColor: '$gray3',
                    width: `${getPercentage(referrer.count)}%`,
                  }}
                />
                <Typography
                  css={{
                    overflow: 'hidden',
                    display: '-webkit-box',
                    '-webkit-line-clamp': 1,
                    '-webkit-box-orient': 'vertical',
                    textOverflow: 'ellipsis',
                  }}
                  size="subheading"
                >
                  {referrer.domain}
                </Typography>
              </Box>
              <Typography size="subheading">{referrer.count}</Typography>
            </Flex>
          ))}
        </Flex>
      ) : (
        <Box css={{ display: 'grid', placeItems: 'center' }}>
          <Typography size="subheading">No data to display</Typography>
        </Box>
      )}
      <Pagination
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
        hasNextPage={hasNextPage}
      />
    </Flex>
  );
};
