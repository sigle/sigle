import { useEffect, useState } from 'react';
import { Box } from '../../ui';

interface NFTImageProps {
  assetIndentifier: string | undefined;
  nftId: string | undefined;
  getNftImageUrl: (assetIdentifier: string, nftId: string) => Promise<string>;
}

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

export const NFTImage = ({
  assetIndentifier,
  nftId,
  getNftImageUrl,
}: NFTImageProps) => {
  const [imageUrl, setImageUrl] = useState<string>();

  useEffect(() => {
    if (assetIndentifier && nftId) {
      const fetchImageUrl = async () => {
        const assetIdentifierSplit = assetIndentifier.split('::');
        console.log(assetIdentifierSplit);
        const nftImageUrl = await getNftImageUrl(
          assetIdentifierSplit[0],
          nftId
        );
        setImageUrl(nftImageUrl);
      };
      fetchImageUrl();
    }
  }, [assetIndentifier, nftId]);

  return (
    <Box
      as="img"
      src={imageUrl}
      css={{
        width: 92,
        height: 92,
        imageRendering: assetIndentifier?.includes('free-punks')
          ? 'pixelated'
          : 'auto',
      }}
    />
  );
};
