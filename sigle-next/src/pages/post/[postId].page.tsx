import { TooltipProvider } from '@radix-ui/react-tooltip';
import { useRouter } from 'next/router';
import Balancer from 'react-wrap-balancer';
import { format } from 'date-fns';
import { Container, Flex, Typography } from '@sigle/ui';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { UserProfile } from '@/components/UserProfile/UserProfile';
import { UserProfilePageHeader } from '@/components/UserProfile/UserProfilePageHeader';
import { UserProfilePosts } from '@/components/UserProfile/UserProfilePosts';
import { trpc } from '@/utils/trpc';

const PostPage = () => {
  const router = useRouter();
  const { session } = useCeramic();
  const userDid = session?.did.parent!;
  const postId = router.query.postId as string;
  const post = trpc.postGet.useQuery({ id: postId });

  const isViewer = userDid === post.data?.did;

  // TODO loading state
  if (post.isLoading) {
    return <div>Loading...</div>;
  }

  // TODO proper 404 page
  if (!post.data) {
    return <div>Not found</div>;
  }

  return (
    <DashboardLayout
      sidebarContent={<UserProfile did={post.data.did} isViewer={isViewer} />}
      // headerContent={
      //   <UserProfilePageHeader did={paramUserDid} isViewer={isViewer} />
      // }
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
