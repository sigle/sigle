import { ArrowRightIcon, CheckIcon, Cross1Icon } from '@radix-ui/react-icons';
import { NonFungibleTokensApi } from '@stacks/blockchain-api-client';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { darkTheme, styled } from '../../stitches.config';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Flex,
  ScrollArea,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
  Typography,
} from '../../ui';
import { getNftMetadata } from '../../utils/gamma';
import { useAuth } from '../auth/AuthContext';
import { NFTImage } from './NftImage';

interface GammaResponse {
  data: NftTokens;
}

interface NftTokens {
  nft_tokens: NftTokenData[];
}

interface NftTokenData {
  asset_id: string;
  collection_contract_id: string;
  token_id: number;
  token_metadata: { image_url: string };
}

interface NonFungibleTokensHoldings {
  asset_identifier?: string;
  block_height?: number;
  tx_id?: string;
  value?: { hex: string; repr: string };
}

const getNftImageUrl = async (assetIdentifier: string, nftId: string) => {
  const res: GammaResponse = await getNftMetadata(assetIdentifier, nftId);
  const url = res.data?.nft_tokens[0].token_metadata.image_url;

  if (url && url.includes('ipfs')) {
    const ipfsHash = url.replace('ipfs://', '');
    return `https://images.gamma.io/ipfs/${ipfsHash}`;
  } else {
    return url;
  }
};

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

const ChooseNFTDialogContent = styled(DialogContent, {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: '$8',
  width: 582,
});

interface ChooseNFTDialogProps {
  open: boolean;
  onOpenChange: () => void;
  setCustomLogo: React.Dispatch<
    React.SetStateAction<
      | (Blob & {
          preview: string;
          name: string;
        })
      | undefined
    >
  >;
}

export const ChooseNFTDialog = ({
  open,
  onOpenChange,
  setCustomLogo,
}: ChooseNFTDialogProps) => {
  const { user } = useAuth();
  const { isLoading: isLoadingUserNFT, data } = useQuery(
    'get-user-nft',
    () => {
      const address = user?.profile.stxAddress.mainnet;
      const nftApi = new NonFungibleTokensApi();
      return nftApi.getNftHoldings({
        principal: address,
      });
    },
    { cacheTime: 0, enabled: open }
  );
  const [activeNFT, setActiveNFT] = useState<string>();
  const [activeNFTImageUrl, setActiveNFTImageUrl] = useState<string>();

  const handleClick = async (assetIdentifier: string, nftId: string) => {
    if (nftId === activeNFT) {
      setActiveNFT('');
      return;
    }

    const assetIdentifierSplit = assetIdentifier.split('::');
    const nftImageUrl = await getNftImageUrl(assetIdentifierSplit[0], nftId);
    setActiveNFT(nftId);
    setActiveNFTImageUrl(nftImageUrl);
  };

  const applyNft = async () => {
    if (!activeNFT) {
      return;
    }

    if (activeNFTImageUrl) {
      const response = await fetch(activeNFTImageUrl);

      const blob = await response.blob();

      setCustomLogo(
        Object.assign(blob, {
          preview: `${activeNFTImageUrl}`,
          name: activeNFT,
        })
      );
    }

    onOpenChange();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ChooseNFTDialogContent>
        <ScrollArea type="scroll" scrollHideDelay={300}>
          <ScrollAreaViewport
            css={{
              maxHeight: 475,
              p: 0,
            }}
          >
            <Box css={{ mb: '$8' }}>
              <DialogTitle asChild>
                <Typography css={{ fontWeight: 600, mt: '$4' }} size="h2">
                  Choose an NFT
                </Typography>
              </DialogTitle>
              <DialogDescription>
                Choose the NFT you want to display as your profile image. <br />{' '}
                If you list or sell it, it will not be displayed anymore.
              </DialogDescription>
            </Box>

            <Flex css={{ mb: '$3' }} justify="center" gap="6" wrap="wrap">
              {data?.results && (
                <>
                  {data.results
                    ?.filter(
                      (result: NonFungibleTokensHoldings) =>
                        !result.asset_identifier?.includes('bns') &&
                        !result.asset_identifier?.includes('owl-link')
                    )
                    .map((item: NonFungibleTokensHoldings) => (
                      <Box
                        key={item.tx_id}
                        onClick={() =>
                          handleClick(
                            item.asset_identifier as string,
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
                        <NFTImage
                          assetIndentifier={item.asset_identifier}
                          nftId={item.value?.repr.replace('u', '')}
                          getNftImageUrl={getNftImageUrl}
                        />
                      </Box>
                    ))}
                </>
              )}
            </Flex>
          </ScrollAreaViewport>
          <ScrollAreaScrollbar orientation="vertical">
            <ScrollAreaThumb />
          </ScrollAreaScrollbar>
          <ScrollAreaCorner />
        </ScrollArea>
        <Button
          disabled={!activeNFT}
          onClick={applyNft}
          size="lg"
          css={{ gap: '$2' }}
        >
          Apply
          <ArrowRightIcon />
        </Button>
      </ChooseNFTDialogContent>
    </Dialog>
  );
};
