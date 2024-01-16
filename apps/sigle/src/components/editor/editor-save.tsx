import { Button } from '@radix-ui/themes';
import { useEditorStore } from './store';

export const EditorSave = ({ onSave }: { onSave: () => void }) => {
  const saving = useEditorStore((state) => state.saving);

  // TODO verify that form is valid otherwise disable button and add message

  return (
    <Button
      size="2"
      color="gray"
      variant="ghost"
      disabled={saving}
      onClick={onSave}
    >
      {saving ? 'Saving...' : 'Save'}
    </Button>
  );
};
