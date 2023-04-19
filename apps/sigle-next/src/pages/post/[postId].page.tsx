import { TooltipProvider } from '@radix-ui/react-tooltip';
import { useRouter } from 'next/router';
import Balancer from 'react-wrap-balancer';
import { format } from 'date-fns';
import Image from 'next/image';
import { Button, Container, Flex, Typography } from '@sigle/ui';
import { styled } from '@sigle/stitches.config';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { UserProfile } from '@/components/UserProfile/UserProfile';
import { UserProfileSkeleton } from '@/components/UserProfile/UserProfileSkeleton';
import { trpc } from '@/utils/trpc';
import { getAddressFromDid } from '@/utils/getAddressFromDid';
import { addressAvatar } from '@/utils';
import { nextImageLoader } from '@/utils/nextImageLoader';
import { shortenAddress } from '@/utils/shortenAddress';
import { CeramicPost } from '@/types/ceramic';
import { pulse } from '@/ui/animations';

const SkeletonContainer = styled('div', {
  animation: `${pulse} $transitions$animate-pulse`,
});

const Skeleton = styled('div', {
  backgroundColor: '$gray3',
  br: '$md',
  maxWidth: '100%',
});

const AvatarContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'center',
  overflow: 'hidden',
  width: 36,
  height: 36,
  br: '$sm',
});

const PostPageHeader = ({
  did,
  isViewer,
  post,
}: {
  did: string;
  isViewer: boolean;
  post: CeramicPost;
}) => {
  const profile = trpc.userProfile.useQuery({ did });

  const address = getAddressFromDid(did);

  if (profile.isLoading) {
    return null;
  }

  return (
    <Flex justify="between" align="center" css={{ flex: 1 }}>
      <Flex align="center" gap="2">
        <AvatarContainer>
          <Image
            loader={nextImageLoader}
            src={addressAvatar(address, 72)}
            alt="Picture of the author"
            width={36}
            height={36}
          />
        </AvatarContainer>
        <Typography
          size="lg"
          css={{
            maxWidth: 300,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {post.title}
        </Typography>
        <Typography size="lg" fontWeight="bold">
          By {profile.data?.displayName || shortenAddress(address)}
        </Typography>
      </Flex>

      {!isViewer ? (
        <Flex gap="2">
          <Button>Follow</Button>
        </Flex>
      ) : null}
    </Flex>
  );
};

const PostPage = () => {
  const router = useRouter();
  const { session } = useCeramic();
  const userDid = session?.did.parent!;
  const postId = router.query.postId as string;
  const post = trpc.postGet.useQuery({ id: postId });

  const isViewer = userDid === post.data?.did;

  if (post.isLoading) {
    return (
      <DashboardLayout sidebarContent={<UserProfileSkeleton />}>
        <Container css={{ maxWidth: 680, py: '$5' }}>
          <SkeletonContainer>
            <Skeleton css={{ height: 48, width: 380 }} />
            <Flex mt="2">
              <Skeleton css={{ height: 26, width: 200 }} />
            </Flex>
            <Flex mt="10" direction="column" gap="2">
              <Skeleton css={{ height: 18, width: '100%' }} />
              <Skeleton css={{ height: 18, width: '100%' }} />
              <Skeleton css={{ height: 18, width: '100%' }} />
              <Skeleton css={{ height: 18, width: '100%' }} />
              <Skeleton css={{ height: 18, width: '100%' }} />
              <Skeleton css={{ height: 18, width: '100%' }} />
            </Flex>
          </SkeletonContainer>
        </Container>
      </DashboardLayout>
    );
  }

  // TODO proper 404 page
  if (!post.data) {
    return <div>Not found</div>;
  }

  return (
    <DashboardLayout
      sidebarContent={<UserProfile did={post.data.did} isViewer={isViewer} />}
      headerContent={
        <PostPageHeader
          did={post.data.did}
          isViewer={isViewer}
          post={post.data}
        />
      }
    >
      <Container css={{ maxWidth: 680, py: '$5' }}>
        <div className="prose dark:prose-invert lg:prose-lg">
          <h1>
            <Balancer>{post.data.title}</Balancer>
          </h1>
          <Flex className="not-prose" gap="2" css={{ marginTop: -10 }}>
            <Typography size="xs" color="gray9" textTransform="uppercase">
              {format(new Date(post.data.createdAt), 'MMM dd')}
            </Typography>
            <Typography size="xs" color="gray9">
              ·
            </Typography>
            <Typography size="xs" color="gray9">
              8 MIN READ
            </Typography>
          </Flex>
          <div dangerouslySetInnerHTML={{ __html: post.data.content }} />
        </div>
      </Container>
    </DashboardLayout>
  );
};

export default function ProtectedPostPage() {
  const router = useRouter();

  if (!router.isReady) return null;

  return (
    <TooltipProvider>
      <PostPage />
    </TooltipProvider>
  );
}
