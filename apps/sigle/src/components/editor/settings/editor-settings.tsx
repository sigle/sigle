import {
  Dialog,
  Flex,
  IconButton,
  Link,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes';
import { useFormContext } from 'react-hook-form';
import { IconHelpCircle, IconX } from '@tabler/icons-react';
import { cn } from '@/lib/cn';
import { useEditorStore } from '../store';
import { EditorPostFormData } from '../editor-form-provider';
import styles from './styles.module.css';
import { SeoPreview } from './seo-preview';
import { MetaImage } from './meta-image';

const canonicalUrlInfo =
  'https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls';

export const EditorSettings = () => {
  const menuOpen = useEditorStore((state) => state.menuOpen);
  const toggleMenu = useEditorStore((state) => state.toggleMenu);
  const { register, watch } = useFormContext<EditorPostFormData>();
  const watchMetaTitle = watch('metaTitle');
  const watchMetaDescription = watch('metaDescription');

  // TODO show validation errors

  return (
    <Dialog.Root open={menuOpen} onOpenChange={toggleMenu}>
      <Dialog.Content
        className={cn(
          'right-0 top-0 bottom-0 fixed max-w-[420px] max-h-full rounded-none',
          styles.dialogContent,
        )}
      >
        <Flex justify="between" align="center" mb="3">
          <Dialog.Title mb="0">Post settings</Dialog.Title>
          <Dialog.Close>
            <IconButton variant="ghost" color="gray">
              <IconX size={20} />
            </IconButton>
          </Dialog.Close>
        </Flex>

        <Flex direction="column" gap="5" mt="4">
          <MetaImage />

          <label>
            <Text
              as="p"
              size="3"
              mb="1"
              color="gray"
              highContrast
              weight="medium"
            >
              Meta title
            </Text>
            <TextField.Input
              placeholder="Meta title"
              maxLength={100}
              {...register('metaTitle')}
            />
            <Text as="p" mt="2" size="1" color="gray">
              Recommended: <Text weight="medium">70</Text> characters. You have
              used <Text weight="medium">{(watchMetaTitle || '').length}</Text>{' '}
              characters.
            </Text>
          </label>

          <label>
            <Text
              as="p"
              size="3"
              mb="1"
              color="gray"
              highContrast
              weight="medium"
            >
              Meta description
            </Text>
            <TextArea
              placeholder="Meta description"
              maxLength={250}
              rows={4}
              {...register('metaDescription')}
            />
            <Text as="p" mt="2" size="1" color="gray">
              Recommended: <Text weight="medium">156</Text> characters. You have
              used{' '}
              <Text weight="medium">{(watchMetaDescription || '').length}</Text>{' '}
              characters.
            </Text>
          </label>

          <label>
            <Text
              className="flex items-center gap-1"
              as="p"
              size="3"
              mb="1"
              color="gray"
              highContrast
              weight="medium"
            >
              Canonical URL
              <Text color="gray">
                <Link href={canonicalUrlInfo} target="_blank" rel="noreferrer">
                  <IconHelpCircle size={16} />
                </Link>
              </Text>
            </Text>
            <TextField.Input
              placeholder="https://"
              maxLength={250}
              {...register('canonicalUrl')}
            />
          </label>
          <SeoPreview />
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
