import { DomainEntity } from '@/__generated__/sigle-api';
import { Button, Typography } from '@/ui';

interface CustomDomainDnsProps {
  domain: DomainEntity;
  setIsEditing: (isEditing: boolean) => void;
}

export const CustomDomainDns = ({
  domain,
  setIsEditing,
}: CustomDomainDnsProps) => {
  return (
    <div className="flex items-center justify-between">
      <Typography size="h4">{domain.domain}</Typography>
      <div className="space-x-4">
        <Button variant="outline">Refresh</Button>
        <Button variant="outline" onClick={() => setIsEditing(true)}>
          Edit
        </Button>
      </div>
    </div>
  );
};
