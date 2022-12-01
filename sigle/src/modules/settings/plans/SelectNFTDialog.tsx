import { DialogDescription } from '@radix-ui/react-dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { NonFungibleTokensApi } from '@stacks/blockchain-api-client';
import { darkTheme, styled } from '../../../stitches.config';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Flex,
  IconButton,
  LoadingSpinner,
  Typography,
} from '../../../ui';
import { useAuth } from '../../auth/AuthContext';
import { sigleConfig } from '../../../config';
import {
  useCreateSubscription,
  useGetUserSubscription,
} from '../../../hooks/subscriptions';
import Image from 'next/legacy/image';
import { useEffect, useMemo, useState } from 'react';
import { ErrorMessage } from '../../../ui/ErrorMessage';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  Cross1Icon,
  ReloadIcon,
} from '@radix-ui/react-icons';
import Link from 'next/link';

interface NonFungibleTokensHoldings {
  asset_identifier?: string;
  block_height?: number;
  tx_id?: string;
  value?: { hex: string; repr: string };
}

const NftOverlay = styled('span', {
  display: 'grid',
  placeItems: 'center',
  overflow: 'hidden',
  borderRadius: '$1',
  height: '100%',

  '&::before': {
    content: '',
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '$gray11',
    opacity: 0.4,
    zIndex: 1,
    transition: '.2s',
  },
});

const NFTPlaceholder = styled('div', {
  width: 92,
  height: 92,
  backgroundColor: '$gray2',
  br: '$1',
});

const SelectNFTDialogContent = styled(DialogContent, {
  display: 'grid',
  placeItems: 'center',
  textAlign: 'center',
  minWidth: 690,
  height: 475,
});

interface SelectNFTDialogProps {
  open: boolean;
  onOpenChange: () => void;
}

export const SelectNFTDialog = ({
  open,
  onOpenChange,
}: SelectNFTDialogProps) => {
  const { user } = useAuth();
  const cache = useQueryClient();
  const { isLoading: isLoadingUserNFT, data } = useQuery(
    ['get-user-nft'],
    () => {
      const address = user?.profile.stxAddress.mainnet;
      const nftApi = new NonFungibleTokensApi();
      return nftApi.getNftHoldings({
        principal: address,
        assetIdentifiers: [
          'SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173.the-explorer-guild::The-Explorer-Guild',
        ],
      });
    },
    { cacheTime: 0, enabled: open }
  );
  const {
    isLoading,
    isError,
    error: createError,
    isSuccess,
    mutate,
  } = useCreateSubscription();
  const { data: subscriptionData } = useGetUserSubscription();
  const [activeNFT, setActiveNFT] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    setActiveNFT(subscriptionData?.nftId.toString());
  }, [subscriptionData]);

  const maxItemsPerPage = 10;

  const currentNfts = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * maxItemsPerPage;
    const lastPageIndex = firstPageIndex + maxItemsPerPage;
    return data?.results.slice(firstPageIndex, lastPageIndex);
  }, [data, currentPage]);

  const currentLastNftItem = currentNfts && currentNfts[currentNfts.length - 1];

  const lastNftItem = data && data.results[data.results.length - 1];

  const hasNextPage = currentLastNftItem === lastNftItem ? false : true;

  const NFTImageURL = `${sigleConfig.explorerGuildUrl}/nft-images/?image=ar://Z4ygyXm-fERGzKEB2bvE7gx98SHcoaP8qdZQo0Kxm6Y`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptionCreateError: any = createError as Error;

  const handleSubmit = () => {
    if (!data) return;
    mutate(Number(activeNFT), {
      /**
       * When the subscription is active we rerun the user subscription query
       * So the elements behind the modal can change.
       */
      onSuccess: () => {
        cache.invalidateQueries(['get-user-subscription']);
      },
    });
  };

  const handleClick = (nftId: string) => {
    if (nftId === activeNFT) {
      setActiveNFT('');
      return;
    }

    setActiveNFT(nftId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <SelectNFTDialogContent>
        {isSuccess ? (
          <Flex direction="column" align="center" gap="5">
            <Image
              src="/static/img/success.gif"
              alt="Success"
              width={92}
              height={92}
            />
            <Box>
              <DialogTitle asChild>
                <Typography
                  size="h2"
                  as="h2"
                  css={{ fontWeight: 600, mb: '$1' }}
                >
                  {!subscriptionData ? 'You just upgraded!' : 'Success!'}
                </Typography>
              </DialogTitle>
              <DialogDescription asChild>
                <Typography size="subheading">
                  {!subscriptionData ? (
                    <span>
                      Congratulations, you've unlocked the full potential of
                      Sigle... <br />
                      Make good use of it!
                    </span>
                  ) : (
                    'You just changed your Creator + plan NFT!'
                  )}
                </Typography>
              </DialogDescription>
            </Box>
            <Link href="/" passHref>
              <Button size="sm" variant="subtle">
                Go to dashboard
              </Button>
            </Link>
          </Flex>
        ) : (
          <Flex
            css={{
              height: '100%',
              width: '100%',
            }}
            justify="between"
            align="center"
          >
            <IconButton
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              aria-label="previous page"
              variant="ghost"
            >
              <ArrowLeftIcon />
            </IconButton>
            <Flex
              css={{
                height: '100%',
              }}
              direction="column"
              justify="between"
              align="center"
            >
              {!data?.results[0] ? (
                <Box>
                  <DialogTitle asChild>
                    <Typography size="h2" as="h2" css={{ fontWeight: 600 }}>
                      Oh! No NFT Found
                    </Typography>
                  </DialogTitle>
                  <DialogDescription asChild>
                    <Typography size="subheading">
                      No Explorer Guild NFTs were found in your wallet
                    </Typography>
                  </DialogDescription>
                </Box>
              ) : (
                <Box>
                  <DialogTitle asChild>
                    <Typography size="h2" as="h2" css={{ fontWeight: 600 }}>
                      Choose an NFT
                    </Typography>
                  </DialogTitle>
                  <DialogDescription asChild>
                    <Typography size="subheading">
                      Choose the Explorer Guild NFT you want to link to your
                      Creator + plan
                    </Typography>
                  </DialogDescription>
                </Box>
              )}

              <Flex css={{ mb: '$3' }} justify="center" gap="6" wrap="wrap">
                {data?.results && !isError && !isLoading && (
                  <>
                    {currentNfts?.map((item: NonFungibleTokensHoldings) => (
                      <Box
                        key={item.tx_id}
                        onClick={() =>
                          handleClick(
                            item.value?.repr.replace('u', '') as string
                          )
                        }
                        css={{
                          position: 'relative',
                          br: '$2',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          width: 92,
                          height: 92,
                          color: '$gray1',

                          '&:hover':
                            activeNFT === item.value?.repr.replace('u', '')
                              ? {
                                  boxShadow: '0 0 0 2px $colors$red11',

                                  '& svg:first-of-type': {
                                    display: 'none',
                                  },

                                  '& svg:last-of-type': {
                                    display: 'block',
                                  },
                                }
                              : {
                                  '&::before': {
                                    display: 'grid',
                                    placeItems: 'center',
                                    color: '$gray1',
                                    content: `#${
                                      item.value?.repr.replace(
                                        'u',
                                        ''
                                      ) as string
                                    }`,
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: 'rgba(22,22,22, 0.6)',
                                    zIndex: 1,
                                    transition: '.2s',

                                    [`.${darkTheme} &`]: {
                                      backgroundColor: 'rgba(252,225,225, 0.6)',
                                    },
                                  },
                                },

                          boxShadow:
                            activeNFT === item.value?.repr.replace('u', '')
                              ? '0 0 0 2px $colors$green11'
                              : 'none',
                        }}
                      >
                        {activeNFT === item.value?.repr.replace('u', '') && (
                          <NftOverlay>
                            <Box
                              css={{
                                zIndex: 1,
                                color: '$gray1',

                                '& svg:last-of-type': {
                                  display: 'none',
                                },
                              }}
                            >
                              <CheckIcon />
                              <Cross1Icon />
                            </Box>
                          </NftOverlay>
                        )}
                        <Box
                          as="img"
                          src={`${NFTImageURL}/${item.value?.repr.replace(
                            'u',
                            ''
                          )}.png&size=170`}
                          css={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                          }}
                        />
                      </Box>
                    ))}
                  </>
                )}

                {isLoadingUserNFT || isLoading ? (
                  <Box>
                    <LoadingSpinner />
                  </Box>
                ) : null}

                {!data?.results[0] && !isError && !isLoadingUserNFT && (
                  <>
                    <NFTPlaceholder />
                    <NFTPlaceholder />
                    <NFTPlaceholder />
                    <NFTPlaceholder />
                    <NFTPlaceholder />
                  </>
                )}

                {!isLoadingUserNFT && isError ? (
                  <ErrorMessage>
                    {subscriptionCreateError.message
                      ? subscriptionCreateError.message
                      : subscriptionCreateError.error}
                  </ErrorMessage>
                ) : null}
              </Flex>

              {data?.results[0] || isLoadingUserNFT ? (
                isError ? (
                  <Button
                    css={{ gap: '$2' }}
                    disabled={isLoadingUserNFT || !activeNFT}
                    size="lg"
                    onClick={handleSubmit}
                  >
                    Retry
                    <span>
                      <ReloadIcon />
                    </span>
                  </Button>
                ) : (
                  <Button
                    disabled={isLoadingUserNFT || !activeNFT}
                    size="lg"
                    onClick={handleSubmit}
                  >
                    Let's go!
                  </Button>
                )
              ) : (
                <Button
                  as="a"
                  href={sigleConfig.gammaUrl}
                  target="_blank"
                  rel="noreferrer"
                  size="lg"
                >
                  Buy on Gamma.io
                </Button>
              )}
            </Flex>
            <IconButton
              size="sm"
              disabled={!hasNextPage}
              onClick={() => setCurrentPage(currentPage + 1)}
              aria-label="page"
              variant="ghost"
            >
              <ArrowRightIcon />
            </IconButton>
          </Flex>
        )}
      </SelectNFTDialogContent>
    </Dialog>
  );
};
