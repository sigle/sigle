import { Badge } from '@sigle/ui';
import { getAddressFromDid } from '@/utils/getAddressFromDid';
import { shortenAddress } from '@/utils/shortenAddress';

interface BadgeAddressProps {
  did: string;
}

export const BadgeAddress = (props: BadgeAddressProps) => {
  const address = getAddressFromDid(props.did);

  return <Badge>{`${shortenAddress(address)}`}</Badge>;
};
