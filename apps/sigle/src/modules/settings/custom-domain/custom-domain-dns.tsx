import {
  CheckCircledIcon,
  CrossCircledIcon,
  ExternalLinkIcon,
} from '@radix-ui/react-icons';
import Link from 'next/link';
import {
  DomainEntity,
  useDomainsControllerVerify,
} from '@/__generated__/sigle-api';
import { Button, LoadingSpinner, Typography } from '@/ui';

interface CustomDomainDnsProps {
  domain: DomainEntity;
  setIsEditing: (isEditing: boolean) => void;
}

export const CustomDomainDns = ({
  domain,
  setIsEditing,
}: CustomDomainDnsProps) => {
  const {
    data: domainVerify,
    isLoading: isLoadingDomainVerify,
    refetch: refetchDomainVerify,
    isFetching: isFetchingDomainVerify,
  } = useDomainsControllerVerify({});

  const isLoading = isLoadingDomainVerify || isFetchingDomainVerify;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Typography size="subheading" css={{ fontWeight: 600 }}>
          <Link
            href={`https://${domain.domain}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1"
          >
            {domain.domain}
            <ExternalLinkIcon />
          </Link>
        </Typography>
        <div className="space-x-4">
          <Button variant="outline" onClick={() => refetchDomainVerify()}>
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex">
          <LoadingSpinner />
          <Typography size="subparagraph">Loading ...</Typography>
        </div>
      ) : null}

      {!isLoading && domainVerify && domainVerify.status === 'misconfigured' ? (
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
            <div className="flex gap-6 rounded-md bg-gray-100 p-4">
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

      {!isLoading && domainVerify && domainVerify.status === 'verified' ? (
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
