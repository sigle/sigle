import {
  Dialog,
  Flex,
  IconButton,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes';
import { useFormContext } from 'react-hook-form';
import { IconX } from '@tabler/icons-react';
import { cn } from '@/lib/cn';
import { useEditorStore } from '../store';
import styles from './styles.module.css';
import { SeoPreview } from './seo-preview';
import { EditorPostFormData } from '../editor-form-provider';

export const EditorSettings = () => {
  const menuOpen = useEditorStore((state) => state.menuOpen);
  const toggleMenu = useEditorStore((state) => state.toggleMenu);
  const { register, watch } = useFormContext<EditorPostFormData>();
  const watchMetaTitle = watch('metaTitle');
  const watchMetaDescription = watch('metaDescription');

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

        <Flex direction="column" gap="3">
          <label>
            <Text as="p" size="2" mb="1">
              Meta title
            </Text>
            <TextField.Input
              placeholder="Meta title"
              maxLength={100}
              {...register('metaTitle')}
            />
            <Text as="p" mt="2" size="1" color="gray">
              Recommended:{' '}
              <Text color="gray" highContrast>
                70
              </Text>{' '}
              characters.
            </Text>
            <Text as="p" size="1" color="gray">
              You have used {(watchMetaTitle || '').length} characters.
            </Text>
          </label>
          <label>
            <Text as="p" size="2" mb="1">
              Meta description
            </Text>
            <TextArea
              placeholder="Meta description"
              maxLength={250}
              rows={4}
              {...register('metaDescription')}
            />
            <Text as="p" mt="2" size="1" color="gray">
              Recommended:{' '}
              <Text color="gray" highContrast>
                156
              </Text>{' '}
              characters.
            </Text>
            <Text as="p" size="1" color="gray">
              You have used {(watchMetaDescription || '').length} characters.
            </Text>
          </label>
          <SeoPreview />
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
