import { Badge, Card, IconButton, Inset, Text } from '@radix-ui/themes';
import { IconCards, IconPencil } from '@tabler/icons-react';
import { useFormContext } from 'react-hook-form';
import type { EditorPostFormData } from '../EditorFormProvider';
import { useEditorStore } from '../store';

export const PublishReviewCollect = () => {
  const { getValues } = useFormContext<EditorPostFormData>();
  const setMenuOpen = useEditorStore((state) => state.setMenuOpen);
  const setPublishOpen = useEditorStore((state) => state.setPublishOpen);
  const data = getValues();

  const collectLimit =
    data.collect.collectLimit?.enabled === true &&
    data.collect.collectLimit.limit
      ? data.collect.collectLimit.limit
      : undefined;

  const openCollectSettings = () => {
    setPublishOpen(false);
    setMenuOpen('collect');
  };

  return (
    <Card size="2">
      <Inset clip="padding-box" side="top" pb="current">
        <div className="flex items-center justify-between border-b border-solid border-gray-4 bg-gray-2 p-4">
          <Text
            as="div"
            size="2"
            weight="medium"
            className="flex items-center gap-2"
          >
            <IconCards size={20} />
            Collect settings
          </Text>
          <IconButton
            variant="ghost"
            color="gray"
            onClick={openCollectSettings}
          >
            <IconPencil size={16} />
          </IconButton>
        </div>
      </Inset>
      <div className="-my-3">
        <div className="flex justify-between py-3">
          <Text size="2" color="gray">
            Type
          </Text>
          <Text size="2">
            {collectLimit ? (
              <>
                Limited edition{' '}
                <Badge color="gray" highContrast>
                  {collectLimit}
                </Badge>
              </>
            ) : (
              'Open edition'
            )}
          </Text>
        </div>
        <div className="flex justify-between border-t border-solid border-gray-4 py-3">
          <Text size="2" color="gray">
            Price
          </Text>
          <Text size="2">
            {data.collect.collectPrice.type === 'free'
              ? 'Free'
              : `${data.collect.collectPrice.price} STX`}
          </Text>
        </div>
      </div>
    </Card>
  );
};
