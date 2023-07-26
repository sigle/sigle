import { TooltipProvider } from '@radix-ui/react-tooltip';
import { useQuery } from '@tanstack/react-query';
import { NonFungibleTokensApi } from '@stacks/blockchain-api-client';
import { useAccount } from '@micro-stacks/react';
import { useEffect } from 'react';
import { Badge, Box, Button, Container, Typography } from '@sigle/ui';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { SettingsMenu } from '@/components/Settings/SettingsMenu';
import { TableFeatures } from '@/components/Settings/Plans/TableFeatures';
import { trpc } from '@/utils/trpc';
import { useToast } from '@/hooks/useToast';
import { ToastAction } from '@/ui/Toast';

const SettingsPlans = () => {
  const { toast } = useToast();
  const { stxAddress } = useAccount();
  const activeSubscription = trpc.subscription.getActive.useQuery();
  const upgradeWithNFT = trpc.subscription.upgradeWithNFT.useMutation();
  const nftsInWallet = useQuery(
    ['nft-in-wallet', stxAddress],
    async () => {
      if (!stxAddress) return;
      const nftApi = new NonFungibleTokensApi();
      const nftHoldings = await nftApi.getNftHoldings({
        principal: stxAddress,
        assetIdentifiers: [
          'SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173.the-explorer-guild::The-Explorer-Guild',
        ],
      });
      return nftHoldings.total;
    },
    {
      // Don't trigger if user is using something else than Stacks
      enabled: !!stxAddress,
    },
  );

  const onUpgradeWithNFT = async () => {
    upgradeWithNFT.mutate(undefined, {
      onSuccess: async (upgraded) => {
        if (upgraded) {
          await activeSubscription.refetch();
          toast({
            description: 'Your plan has been upgraded!',
          });
        }
      },
    });
  };

  const shouldShowAlert =
    activeSubscription.isFetched &&
    !activeSubscription.data &&
    nftsInWallet.data &&
    nftsInWallet.data > 0;

  useEffect(() => {
    if (shouldShowAlert && nftsInWallet.data) {
      toast({
        description: `Use your ${
          nftsInWallet.data
        } The Explorer Guild NFTs to enable your ${
          nftsInWallet.data > 3 ? 'Publisher' : 'Basic'
        } lifetime plan.`,
        action: (
          <ToastAction altText="Upgrade" onClick={onUpgradeWithNFT}>
            Upgrade
          </ToastAction>
        ),
        duration: 60000,
      });
    }
  }, [nftsInWallet.data, shouldShowAlert]);

  return (
    <DashboardLayout
      headerContent={
        <Typography size="xl" fontWeight="bold">
          Settings
        </Typography>
      }
    >
      <Container css={{ maxWidth: 770, py: '$5' }}>
        <SettingsMenu />
        <div className="relative">
          <div className="absolute inset-0 -z-10 flex">
            <div className="ml-[50%] flex w-1/4">
              <Box
                css={{
                  backgroundColor: '$gray2',
                  borderColor: '$gray5',
                }}
                className="w-full rounded-t-xl border-x border-t"
              />
            </div>
          </div>
          <table className="w-full">
            <colgroup>
              <col className="w-1/4" />
              <col className="w-1/4" />
              <col className="w-1/4" />
              <col className="w-1/4" />
            </colgroup>
            <thead>
              <tr>
                <td />
                <th scope="col" className="flex gap-2 px-6 pt-6 text-left">
                  <Typography size="sm" fontWeight="semiBold">
                    Starter
                  </Typography>
                  {activeSubscription.isFetched && !activeSubscription.data && (
                    <Badge>Current plan</Badge>
                  )}
                </th>
                <th scope="col" className="px-6 pt-6 text-left">
                  <Typography size="sm" fontWeight="semiBold">
                    Basic
                  </Typography>
                  {activeSubscription.data?.plan === 'BASIC' && (
                    <Badge>Current plan</Badge>
                  )}
                </th>
                <th scope="col" className="px-6 pt-6 text-left">
                  <Typography size="sm" fontWeight="semiBold">
                    Publisher
                  </Typography>
                  {activeSubscription.data?.plan === 'PUBLISHER' && (
                    <Badge>Current plan</Badge>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" />
                <td className="flex flex-col px-6 pt-2">
                  <div className="flex items-baseline gap-1">
                    <Typography size="xl" fontWeight="bold">
                      Free
                    </Typography>
                  </div>
                  <Typography size="xs" color="gray9">
                    The fundamentals
                  </Typography>
                </td>
                <td className="px-6 pt-2">
                  <div className="flex items-baseline gap-1">
                    <Typography size="xl" fontWeight="bold">
                      $12
                    </Typography>
                    <Typography size="sm" fontWeight="semiBold">
                      /month
                    </Typography>
                  </div>
                  <Typography size="xs" color="gray9">
                    or free with 1 NFT
                  </Typography>
                  <Button className="mt-6 w-full">Buy plan</Button>
                </td>
                <td className="px-6 pt-2">
                  <div className="flex items-baseline gap-1">
                    <Typography size="xl" fontWeight="bold">
                      $29
                    </Typography>
                    <Typography size="sm" fontWeight="semiBold">
                      /month
                    </Typography>
                  </div>
                  <Typography size="xs" color="gray9">
                    or free with 3 NFT
                  </Typography>
                  <Button className="mt-6 w-full">Buy plan</Button>
                </td>
              </tr>
              <tr>
                <th
                  scope="colgroup"
                  colSpan={4}
                  className="pb-2 pt-4 text-left"
                >
                  <Typography size="sm" fontWeight="semiBold">
                    Features
                  </Typography>
                </th>
              </tr>
              <TableFeatures />
            </tbody>
          </table>
        </div>
      </Container>
    </DashboardLayout>
  );
};

export default function ProtectedSettings() {
  // TODO auth protect
  const { session } = useCeramic();

  return (
    <TooltipProvider>{session ? <SettingsPlans /> : null}</TooltipProvider>
  );
}
