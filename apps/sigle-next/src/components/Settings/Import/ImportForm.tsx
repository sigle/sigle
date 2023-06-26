import { Button, Input, LoadingSpinner, Typography } from '@sigle/ui';
import { useImportStore } from './store';

export const ImportForm = () => {
  const status = useImportStore((state) => state.status);
  const setStatus = useImportStore((state) => state.setStatus);
  const processed = useImportStore((state) => state.processed);
  const total = useImportStore((state) => state.total);
  const setTotal = useImportStore((state) => state.setTotal);

  // TODO take it from the form
  const url = 'https://app.sigle.io/sigle.btc';

  const handleSigleBlogMigration = async (e) => {
    e.preventDefault();
    console.log('migrating', url);
    // TODO show user progress of the migration
    setStatus('loading');
    setTotal(100);
  };

  if (status === 'loading') {
    return (
      <div className="mt-10 flex flex-col items-center text-center">
        <LoadingSpinner />
        <Typography className="mt-4" size="sm">
          Migrating your blog to Sigle. This may take a while...
          <br />
          {processed}/{total} posts migrated
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
