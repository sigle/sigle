import { lookupProfile } from 'micro-stacks/storage';
import { Button, Input, LoadingSpinner, Typography } from '@sigle/ui';
import { useImportStore } from './store';
import {
  Disposable,
  IEnvironment,
  commitMutation,
  graphql,
} from 'relay-runtime';
import { ImportFormCreatePostMutation } from '@/__generated__/relay/ImportFormCreatePostMutation.graphql';
import { GaiaStoryFile, GaiaStory } from '@/types/gaia';
import { useRelayStore } from '@/lib/relay';

function importNewPost(environment: IEnvironment, file: GaiaStory) {
  return new Promise(function (
    resolve: (value: any) => void,
    reject: (reason?: any) => void
  ) {
    commitMutation<ImportFormCreatePostMutation>(environment, {
      mutation: graphql`
        mutation ImportFormCreatePostMutation($input: CreatePostInput!) {
          createPost(input: $input) {
            clientMutationId
            document {
              id
            }
          }
        }
      `,
      variables: {
        input: {
          content: {
            status: 'PUBLISHED',
            title: file.title,
            content: file.content,
            featuredImage: file.coverImage,
            metaTitle: file.metaTitle,
            metaDescription: file.metaDescription,
            metaImage: file.metaImage,
            canonicalUrl: file.canonicalUrl,
            // TODO createdAt
          },
        },
      },
      onCompleted: function (payload, errors) {
        if (errors) {
          reject(errors[0]);
          return;
        }
        resolve(payload);
      },
      onError: function (error) {
        reject(error);
      },
    });
  });
}

export const ImportForm = () => {
  const relayEnvironment = useRelayStore((store) => store.environment);
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
    const posts: GaiaStoryFile = await data.json();
    // TODO handle status 404
    setTotal(posts.stories.length);

    // 2. Migrate the posts one by one to the new format
    for (const [index, story] of posts.stories.entries()) {
      const data = await fetch(`${bucketUrl}${story.id}.json`);
      // TODO handle status 404
      const post: GaiaStory = await data.json();
      console.log(post);
      // 3. Save them to ceramic
      await importNewPost(relayEnvironment, post);
      setProcessed(index + 1);
      // Wait 200 ms to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    setStatus('success');
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

  if (status === 'success') {
    return (
      <div className="mt-10 flex flex-col items-center text-center">
        <Typography size="sm" fontWeight="semiBold">
          Your blog has been migrated successfully!
        </Typography>
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
