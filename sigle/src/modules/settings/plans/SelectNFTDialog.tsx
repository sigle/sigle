import { DialogDescription } from '@radix-ui/react-dialog';
import { useMutation, useQuery } from 'react-query';
import { NonFungibleTokensApi } from '@stacks/blockchain-api-client';
import { cvToValue } from '@stacks/transactions';
import { styled } from '../../../stitches.config';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from '../../../ui';
import { useAuth } from '../../auth/AuthContext';
import { sigleConfig } from '../../../config';

const SelectNFTDialogContent = styled(DialogContent, {
  textAlign: 'center',
  minWidth: 690,
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

  const { isLoading, isError, isSuccess, mutate } = useMutation(
    (nftId: number) =>
      fetch(`${sigleConfig.apiUrl}/api/subscriptions/creatorPlus`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ nftId }),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => res.json()),
    {
      onSuccess: (data) => {
        // TODO toast success
        // TODO for now errors triggers onSuccess
        console.log(data);

        onOpenChange();
      },
    }
  );

  console.log(data, error, isErrorUserNFT, isLoadingUserNFT);

  const handleSubmit = () => {
    if (!data) return;
    const nftId = Number((data.results[0] as any).value.repr.replace('u', ''));
    mutate(nftId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <SelectNFTDialogContent>
        <DialogTitle asChild>
          <Typography size="h2" as="h2" css={{ fontWeight: 600 }}>
            Choose an NFT
          </Typography>
        </DialogTitle>
        <DialogDescription asChild>
          <Typography size="subheading">
            Choose the Explorer Guild NFT you want to link to your Creator +
            plan
          </Typography>
        </DialogDescription>
        <Button size="lg" onClick={handleSubmit}>
          Let's go!
        </Button>
      </SelectNFTDialogContent>
    </Dialog>
  );
};
