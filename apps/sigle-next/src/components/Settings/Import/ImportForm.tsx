import { lookupProfile } from 'micro-stacks/storage';
import { Button, Input, LoadingSpinner, Typography } from '@sigle/ui';
import { useImportStore } from './store';

export const ImportForm = () => {
  const status = useImportStore((state) => state.status);
  const setStatus = useImportStore((state) => state.setStatus);
  const processed = useImportStore((state) => state.processed);
  const setProcessed = useImportStore((state) => state.setProcessed);
  const total = useImportStore((state) => state.total);
  const setTotal = useImportStore((state) => state.setTotal);

  // TODO take it from the form
  const url = 'sigle.btc';

  const handleSigleBlogMigration = async (e) => {
    e.preventDefault();

    setStatus('loading');

    // 1. Get the list of posts from the API
    const userProfile = await lookupProfile({ username: url });
    const appUrl = 'https://app.sigle.io';
    const bucketUrl = userProfile?.apps?.[appUrl];
    const data = await fetch(`${bucketUrl}publicStories.json`);
    const posts = await data.json();
    // TODO handle status 404
    setTotal(posts.stories.length);

    // 2. Migrate the posts one by one to the new format
    for (const [index, story] of posts.stories.entries()) {
      // 3. Save them to ceramic
      setProcessed(index + 1);
      // Sleep for 2 seconds to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  };

  if (status === 'loading') {
    return (
      <div className="mt-10 flex flex-col items-center text-center">
        <LoadingSpinner />
        <Typography className="mt-6" size="sm">
          Migrating your blog to Sigle. This may take a while...
        </Typography>
        {total > 0 && (
          <Typography className="mt-1" size="sm">
            {processed}/{total} posts migrated
          </Typography>
        )}
      </div>
    );
  }

  return (
    <form className="mt-4 text-center" onSubmit={handleSigleBlogMigration}>
      <Typography size="sm" fontWeight="semiBold">
        Enter the url of the Sigle blog you want to migrate
      </Typography>
      <Input className="mt-2" />
      <Button className="mt-2">Submit</Button>
    </form>
  );
};
