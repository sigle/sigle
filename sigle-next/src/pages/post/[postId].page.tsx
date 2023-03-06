import { TooltipProvider } from '@radix-ui/react-tooltip';
import { useRouter } from 'next/router';
import Balancer from 'react-wrap-balancer';
import { Container } from '@sigle/ui';
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

  // TODO proper 404 page
  if (!post.data) {
    return <div>Not found</div>;
  }

  console.log(post.data);

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
