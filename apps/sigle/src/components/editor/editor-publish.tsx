import { Button } from '@radix-ui/themes';
import { IconRocket } from '@tabler/icons-react';
import { useEditorStore } from './store';

export const EditorPublish = () => {
  const togglePublish = useEditorStore((state) => state.togglePublish);

  return (
    <Button size="2" variant="ghost" onClick={() => togglePublish(true)}>
      Publish
      <IconRocket size={16} />
    </Button>
  );
};
