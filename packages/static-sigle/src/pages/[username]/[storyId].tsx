import { useGetFile } from '@micro-stacks/react';
import { lookupProfile } from 'micro-stacks/storage';
import { useRouter } from 'next/router';

function StoryPage() {
  const username = 'sigleapp.id.blockstack';
  const storyId = 'mgQZnGiTHCcEkMC7Z9Ljb';

  const { isLoading, data } = useGetFile(`settings.json`);

  console.log(data);

  return <div>Welcome to Next.js!</div>;
}

export default StoryPage;
