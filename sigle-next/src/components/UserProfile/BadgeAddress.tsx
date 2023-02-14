import { Badge } from '@sigle/ui';
import { getAddressFromDid } from '@/utils/getAddressFromDid';

interface BadgeAddressProps {
  did: string;
}

export const BadgeAddress = (props: BadgeAddressProps) => {
  const address = getAddressFromDid(props.did);

  return (
    <Badge>
      {`${address.split('').slice(0, 5).join('')}…${address
        .split('')
        .slice(-5)
        .join('')}`}
    </Badge>
  );
};
