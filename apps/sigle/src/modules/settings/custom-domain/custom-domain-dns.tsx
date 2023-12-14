import {
  CheckCircledIcon,
  CrossCircledIcon,
  ExternalLinkIcon,
} from '@radix-ui/react-icons';
import { Button, Text } from '@radix-ui/themes';
import Link from 'next/link';
import {
  DomainEntity,
  useDomainsControllerVerify,
} from '@/__generated__/sigle-api';
import { LoadingSpinner } from '@/ui';

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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Text size="3" weight="medium" asChild>
          <Link
            href={`https://${domain.domain}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1"
          >
            {domain.domain}
            <ExternalLinkIcon />
          </Link>
        </Text>
        <div className="space-x-4">
          <Button
            variant="outline"
            color="gray"
            onClick={() => refetchDomainVerify()}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            color="gray"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex">
          <LoadingSpinner />
          <Text size="2">Loading ...</Text>
        </div>
      ) : null}

      {!isLoading && domainVerify && domainVerify.status === 'misconfigured' ? (
        <div className="space-y-6">
          <Text
            as="div"
            size="2"
            color="orange"
            className="flex items-center gap-1"
          >
            <CrossCircledIcon />
            Invalid Configuration
          </Text>
          <div className="space-y-4">
            <Text as="div" size="2">
              Set the following record on your DNS provider to continue:
            </Text>
            <div className="flex gap-6 rounded-md bg-gray-100 p-4">
              <div className="space-y-2">
                <Text as="div" size="2" weight="medium">
                  Type
                </Text>
                <Text as="div" size="2">
                  CNAME
                </Text>
              </div>
              <div className="space-y-2">
                <Text as="div" size="2" weight="medium">
                  Name
                </Text>
                <Text as="div" size="2">
                  {domain.domain.split('.')[0]}
                </Text>
              </div>
              <div className="space-y-2">
                <Text as="div" size="2" weight="medium">
                  Value
                </Text>
                <Text as="div" size="2">
                  cname.sigle.io.
                </Text>
              </div>
            </div>
            <Text as="div" size="2">
              Depending on your provider, it might take some time for the DNS
              records to apply.
            </Text>
          </div>
        </div>
      ) : null}

      {!isLoading && domainVerify && domainVerify.status === 'verified' ? (
        <div>
          <Text size="2" color="green" className="flex items-center gap-1">
            <CheckCircledIcon />
            Valid Configuration
          </Text>
        </div>
      ) : null}
    </div>
  );
};
