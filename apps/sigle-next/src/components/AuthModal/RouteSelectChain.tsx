import { useModal as useConnectKitModal } from 'connectkit';
import {
  Button,
  DialogDescription,
  DialogDivider,
  DialogTitle,
  Flex,
  Typography,
} from '@sigle/ui';
import { useAuthModalStore } from './store';

export const RouteSelectChain = () => {
  const { setOpen: setConnectKitOpen } = useConnectKitModal();
  const setOpen = useAuthModalStore((state) => state.setOpen);
  const setRoute = useAuthModalStore((state) => state.setRoute);

  const connectEthereum = () => {
    setOpen(false);
    setConnectKitOpen(true);
  };

  const connectStacks = () => {
    setRoute('connect');
  };

  return (
    <>
      <DialogTitle>
        <Typography size="md" fontWeight="bold" css={{ textAlign: 'center' }}>
          Select chain
        </Typography>
      </DialogTitle>
      <DialogDescription asChild>
        <>
          <Typography
            size="sm"
            color="gray9"
            css={{ textAlign: 'center', mt: '$3' }}
          >
            Select the chain you want to connect to.
          </Typography>
          <DialogDivider />
          <Flex direction="column" gap="3">
            <Button
              size="lg"
              onClick={connectEthereum}
              //   rightIcon={<IconHiroWallet />}
              css={{ justifyContent: 'space-between' }}
            >
              Ethereum
            </Button>
            <Button
              size="lg"
              onClick={connectStacks}
              //   rightIcon={<IconXverseWallet />}
              css={{ justifyContent: 'space-between' }}
            >
              Stacks
            </Button>
          </Flex>
        </>
      </DialogDescription>
    </>
  );
};
