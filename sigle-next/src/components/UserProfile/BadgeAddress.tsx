import { Badge } from '@sigle/ui';

interface BadgeAddressProps {
  did: string;
}

export const BadgeAddress = (props: BadgeAddressProps) => {
  const address = props.did.split(':')[4];

  return (
    <Badge>
      {`${address.split('').slice(0, 5).join('')}-${address
        .split('')
        .slice(-5)
        .join('')}`}
    </Badge>
  );
};
