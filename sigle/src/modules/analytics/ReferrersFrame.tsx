import { stagger } from 'motion';
import { useMotionAnimate } from 'motion-hooks';
import { useEffect, useMemo, useState } from 'react';
import { Box, Flex, Text } from '../../ui';
import { Pagination } from './Pagination';

interface ReferrersItemProps {
  name: string;
  views: number;
  id: number;
}

const referrersMock: ReferrersItemProps[] = [
  {
    name: 'app.blockstack.org',
    views: 832,
    id: Math.floor(Math.random() * Date.now() * 100),
  },
  {
    name: 'Facebook',
    views: 421,
    id: Math.floor(Math.random() * Date.now() * 100),
  },
  {
    name: 'Twitter',
    views: 124,
    id: Math.floor(Math.random() * Date.now() * 100),
  },
  {
    name: 'Instagram',
    views: 92,
    id: Math.floor(Math.random() * Date.now() * 100),
  },
  {
    name: 'Medium',
    views: 85,
    id: Math.floor(Math.random() * Date.now() * 100),
  },
  {
    name: 'Google',
    views: 63,
    id: Math.floor(Math.random() * Date.now() * 100),
  },
  {
    name: 'linktr.ee',
    views: 60,
    id: Math.floor(Math.random() * Date.now() * 100),
  },
  {
    name: 'DuckDuckGo',
    views: 42,
    id: Math.floor(Math.random() * Date.now() * 100),
  },
  {
    name: 'Linkedin',
    views: 39,
    id: Math.floor(Math.random() * Date.now() * 100),
  },
  {
    name: 'Reddit',
    views: 12,
    id: Math.floor(Math.random() * Date.now() * 100),
  },
  {
    name: 'Substack',
    views: 10,
    id: Math.floor(Math.random() * Date.now() * 100),
  },
  {
    name: 'Yahoo!',
    views: 6,
    id: Math.floor(Math.random() * Date.now() * 100),
  },
];

export const ReferrersFrame = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
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

  // how many stories we should show on each page
  let itemSize = 10;

  const currentReferrers = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * itemSize;
    const lastPageIndex = firstPageIndex + itemSize;
    return referrersMock.slice(firstPageIndex, lastPageIndex);
  }, [currentPage]);

  const hasNextPage =
    currentReferrers[currentReferrers.length - 1] ===
    referrersMock[referrersMock.length - 1]
      ? false
      : true;

  const total =
    referrersMock &&
    referrersMock.map((item) => item.views).reduce((a, b) => a + b);

  // clamp min value to 10% - see https://github.com/sigle/sigle/issues/451 for context
  const clamp = (num: number, min: number, max: number) =>
    Math.min(Math.max(num, min), max);

  const getPercentage = (views: number) => {
    const percentage = Math.round((100 * views) / total);
    return clamp(percentage, 10, percentage);
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
              key={referrer.id}
              gap="5"
              justify="between"
              align="center"
            >
              <Box
                css={{
                  flex: 1,
                  width: 180,
                }}
              >
                <Box
                  css={{
                    p: '$1',
                    br: '$1',
                    backgroundColor: '$gray3',
                    minWidth: 40,
                    width: `${getPercentage(referrer.views)}%`,
                  }}
                >
                  <Text size="sm">{referrer.name}</Text>
                </Box>
              </Box>
              <Text size="sm">{referrer.views}</Text>
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
