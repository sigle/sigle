import { NonFungibleTokensApi } from '@stacks/blockchain-api-client';
import { useQuery } from '@tanstack/react-query';
import { styled } from '../../stitches.config';
import {
  Box,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Typography,
} from '../../ui';
import { useAuth } from '../auth/AuthContext';

const ChooseNFTDialogContent = styled(DialogContent, {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'center',
  gap: '$8',
  minWidth: 582,
  minHeight: 475,
});

interface ChooseNFTDialogProps {
  open: boolean;
  onOpenChange: () => void;
}

export const ChooseNFTDialog = ({
  open,
  onOpenChange,
}: ChooseNFTDialogProps) => {
  const { user } = useAuth();
  const { isLoading: isLoadingUserNFT, data } = useQuery(
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ChooseNFTDialogContent>
        <Box>
          <DialogTitle asChild>
            <Typography css={{ fontWeight: 600, mt: '$4' }} size="h2">
              Choose an NFT
            </Typography>
          </DialogTitle>
          <DialogDescription>
            Choose the NFT you want to display as your profile image. <br /> If
            you list or sell it, it will not be displayed anymore.
          </DialogDescription>
        </Box>
      </ChooseNFTDialogContent>
    </Dialog>
  );
};
