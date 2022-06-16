import { DialogDescription } from '@radix-ui/react-dialog';
import { useQuery } from 'react-query';
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
import { useCreateSubscription } from '../../../hooks/subscriptions';
import Image from 'next/image';
import { useState } from 'react';
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
  const {
    isLoading: isLoadingUserNFT,
    error,
    isError: isErrorUserNFT,
    data,
  } = useQuery(
    'get-user-nft',
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
  const [selectedNFT, setSelectedNFT] = useState<string>();
  const [unSelectedNFT, setUnselectedNFT] = useState<string | null>(null);

  console.log(data, error, isErrorUserNFT, isLoadingUserNFT, createError);

  const NFTImageURL = `${sigleConfig.explorerGuildUrl}/nft-images/?image=ar://Z4ygyXm-fERGzKEB2bvE7gx98SHcoaP8qdZQo0Kxm6Y`;

  const subscriptionCreateError: any = createError as Error;

  const handleSubmit = () => {
    if (!data) return;
    const nftId = Number((data.results[0] as any).value.repr.replace('u', ''));
    mutate(nftId);
  };

  const handleClick = (nftId: string) => {
    setUnselectedNFT('');
    if (nftId === selectedNFT) {
      setSelectedNFT('');
      setUnselectedNFT(nftId);
      return;
    }

    setSelectedNFT(nftId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <SelectNFTDialogContent>
        {isSuccess ? (
          <Flex direction="column" align="center" gap="5">
            <Image src="/static/img/success.gif" width={92} height={92} />
            <Box>
              <DialogTitle asChild>
                <Typography
                  size="h2"
                  as="h2"
                  css={{ fontWeight: 600, mb: '$1' }}
                >
                  You just upgraded!
                </Typography>
              </DialogTitle>
              <DialogDescription asChild>
                <Typography size="subheading">
                  Congratulations, you've unlocked the full potential of
                  Sigle... <br /> Make good use of it!
                </Typography>
              </DialogDescription>
            </Box>
            <Link href="/" passHref>
              <Button variant="subtle">Go to dashboard</Button>
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
            <IconButton variant="ghost">
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
                    {data?.results.map((item: NonFungibleTokensHoldings) => (
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
                            selectedNFT === item.value?.repr.replace('u', '') ||
                            unSelectedNFT === item.value?.repr.replace('u', '')
                              ? {}
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
                            unSelectedNFT === item.value?.repr.replace('u', '')
                              ? '0 0 0 2px $colors$red11'
                              : selectedNFT ===
                                item.value?.repr.replace('u', '')
                              ? '0 0 0 2px $colors$green11'
                              : 'none',
                        }}
                      >
                        {selectedNFT === item.value?.repr.replace('u', '') && (
                          <Box
                            as="span"
                            css={{
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
                            }}
                          >
                            <Box
                              css={{
                                zIndex: 1,
                                color: '$gray1',
                              }}
                            >
                              <CheckIcon />
                            </Box>
                          </Box>
                        )}
                        {unSelectedNFT ===
                          item.value?.repr.replace('u', '') && (
                          <Box
                            as="span"
                            css={{
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
                            }}
                          >
                            <Box
                              css={{
                                zIndex: 1,
                                color: '$gray1',
                              }}
                            >
                              <Cross1Icon />
                            </Box>
                          </Box>
                        )}
                        <Image
                          loader={({ src }) =>
                            `${NFTImageURL}/${item.value?.repr.replace(
                              'u',
                              ''
                            )}.png&size=170`
                          }
                          layout="fill"
                          src={`${NFTImageURL}/${item.value?.repr.replace(
                            'u',
                            ''
                          )}.png&size=170`}
                          objectFit="cover"
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
                    disabled={isLoadingUserNFT || !selectedNFT}
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
                    disabled={isLoadingUserNFT || !selectedNFT}
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
            <IconButton variant="ghost">
              <ArrowRightIcon />
            </IconButton>
          </Flex>
        )}
      </SelectNFTDialogContent>
    </Dialog>
  );
};
