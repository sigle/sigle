import {
  DomainEntity,
  useDomainsControllerVerify,
} from '@/__generated__/sigle-api';
import { Button, LoadingSpinner, Typography } from '@/ui';
import { CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons';

interface CustomDomainDnsProps {
  domain: DomainEntity;
  setIsEditing: (isEditing: boolean) => void;
}

export const CustomDomainDns = ({
  domain,
  setIsEditing,
}: CustomDomainDnsProps) => {
  const { data: domainVerify, isLoading: isLoadingDomainVerify } =
    useDomainsControllerVerify({});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Typography size="subheading" css={{ fontWeight: 600 }}>
          {domain.domain}
        </Typography>
        <div className="space-x-4">
          <Button variant="outline">Refresh</Button>
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        </div>
      </div>

      {isLoadingDomainVerify ? (
        <div className="flex">
          <LoadingSpinner />
          <Typography size="subparagraph">Loading ...</Typography>
        </div>
      ) : null}

      {!isLoadingDomainVerify &&
      domainVerify &&
      domainVerify.status === 'misconfigured' ? (
        <div className="space-y-8">
          <Typography
            size="subparagraph"
            color="orange"
            className="flex items-center gap-1"
          >
            <CrossCircledIcon />
            Invalid Configuration
          </Typography>
          <div className="space-y-4">
            <Typography size="subparagraph">
              Set the following record on your DNS provider to continue:
            </Typography>
            <div className="p-4 bg-gray-100 rounded-md flex gap-6">
              <div className="space-y-2">
                <Typography size="subparagraph" css={{ fontWeight: 600 }}>
                  Type
                </Typography>
                <Typography size="subparagraph">CNAME</Typography>
              </div>
              <div className="space-y-2">
                <Typography size="subparagraph" css={{ fontWeight: 600 }}>
                  Name
                </Typography>
                <Typography size="subparagraph">
                  {domain.domain.split('.')[0]}
                </Typography>
              </div>
              <div className="space-y-2">
                <Typography size="subparagraph" css={{ fontWeight: 600 }}>
                  Value
                </Typography>
                <Typography size="subparagraph">cname.sigle.io.</Typography>
              </div>
            </div>
            <Typography size="subparagraph">
              Depending on your provider, it might take some time for the DNS
              records to apply.
            </Typography>
          </div>
        </div>
      ) : null}

      {!isLoadingDomainVerify &&
      domainVerify &&
      domainVerify.status === 'verified' ? (
        <div>
          <Typography
            size="subparagraph"
            color="green"
            className="flex items-center gap-1"
          >
            <CheckCircledIcon />
            Valid Configuration
          </Typography>
        </div>
      ) : null}
    </div>
  );
};
