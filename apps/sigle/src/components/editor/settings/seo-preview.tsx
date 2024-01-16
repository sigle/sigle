import { AspectRatio, Card, Inset, Text, Tooltip } from '@radix-ui/themes';
import { IconHelpCircle } from '@tabler/icons-react';
import { useFormContext } from 'react-hook-form';
import { prettifyUrl } from '@/lib/prettify-url';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import { sigleConfig } from '@/config';
import { useEditorStore } from '../store';
import { EditorPostFormData } from '../editor-form-provider';

export const SeoPreview = () => {
  const editor = useEditorStore((state) => state.editor);
  const { watch } = useFormContext<EditorPostFormData>();
  const watchTitle = watch('title');
  const watchMetaTitle = watch('metaTitle');
  const watchMetaDescription = watch('metaDescription');
  const watchCoverImage = watch('coverImage');

  const metaTitle = watchMetaTitle || watchTitle;
  const metaDescription =
    watchMetaDescription || editor?.getText().slice(0, 90);
  // TODO custom meta image
  const metaImage = watchCoverImage;

  return (
    <div>
      <Text
        className="flex items-center gap-1"
        as="div"
        size="3"
        mb="1"
        color="gray"
        highContrast
        weight="medium"
      >
        Preview
        <Text color="gray">
          <Tooltip
            delayDuration={250}
            content="This is how the post will be displayed when sharing the link on social media"
          >
            <IconHelpCircle size={16} />
          </Tooltip>
        </Text>
      </Text>
      <Card size="1">
        {metaImage ? (
          <Inset
            clip="padding-box"
            side="top"
            className="mb-2 border-b border-solid border-gray-6"
          >
            <AspectRatio ratio={1.91 / 1}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImageUrl(metaImage)}
                alt="Cover image"
                style={{
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'var(--gray-5)',
                }}
              />
            </AspectRatio>
          </Inset>
        ) : null}
        <Text as="div" size="2" className="truncate">
          {metaTitle}
        </Text>
        <Text
          as="div"
          size="2"
          color="gray"
          className="truncate"
          style={{ marginTop: '2px' }}
        >
          {metaDescription}
        </Text>
        <Text as="div" size="2" color="gray" className="truncate">
          {prettifyUrl(sigleConfig.appUrl)}
        </Text>
      </Card>
    </div>
  );
};
