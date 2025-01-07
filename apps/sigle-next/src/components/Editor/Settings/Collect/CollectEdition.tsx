import { Flex, RadioCards, Text, TextField } from '@radix-ui/themes';
import { useFormContext, useFormState } from 'react-hook-form';
import type { EditorPostFormData } from '../../EditorFormProvider';

const DEFAULT_EDITION_LIMIT = 100;

export const CollectEdition = () => {
  const { setValue, watch, register } = useFormContext<EditorPostFormData>();
  const watchCollectLimitEnabled = watch('collect.collectLimit.enabled');
  const watchCollectLimitLimit = watch('collect.collectLimit.limit');
  const { errors } = useFormState<EditorPostFormData>({
    name: ['collect.collectLimit.enabled', 'collect.collectLimit.limit'],
  });

  const onEditionChange = (value: string) => {
    const isFixedEdition = value === 'fixed-edition';
    setValue('collect.collectLimit.enabled', isFixedEdition, {
      shouldValidate: true,
    });
    if (isFixedEdition) {
      setValue(
        'collect.collectLimit.limit',
        watchCollectLimitLimit || DEFAULT_EDITION_LIMIT,
        {
          shouldValidate: true,
        },
      );
    }
  };

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const limitErrorMessage = (errors?.collect?.collectLimit as any)?.limit
    ?.message;

  return (
    <div className="space-y-3">
      <Text as="p" size="2" weight="medium">
        Edition
      </Text>
      <RadioCards.Root
        columns="2"
        value={watchCollectLimitEnabled ? 'fixed-edition' : 'open-edition'}
        onValueChange={onEditionChange}
      >
        <RadioCards.Item value="open-edition">
          <Flex direction="column" width="100%">
            <Text weight="bold">Open edition</Text>
            <Text>∞</Text>
          </Flex>
        </RadioCards.Item>
        <RadioCards.Item value="fixed-edition">
          <Flex direction="column" width="100%">
            <Text weight="bold">Limited edition</Text>
            <Text>0/{watchCollectLimitLimit || DEFAULT_EDITION_LIMIT}</Text>
          </Flex>
        </RadioCards.Item>
      </RadioCards.Root>
      {watchCollectLimitEnabled && (
        <div className="space-y-2 animate-in fade-in">
          <div className="space-y-1">
            <Text as="p" size="2">
              Number of editions
            </Text>
            <Text as="p" size="1" color="gray">
              After publishing, the edition count can only be reduced.
            </Text>
          </div>
          <TextField.Root
            className="w-full"
            type="number"
            min="1"
            {...register('collect.collectLimit.limit')}
          >
            <TextField.Slot side="right">editions</TextField.Slot>
          </TextField.Root>
        </div>
      )}
      {/* <Flex gap="2" align="center" justify="between" className="min-h-[32px]">
        <div className="flex items-center">
          <Switch
            mr="2"
            size="1"
            checked={!!watchCollectLimitEnabled}
            onCheckedChange={onCheckedChange}
          />
          Create a limited edition
        </div>
        {watchCollectLimitEnabled && (
          <TextField.Root
            className="w-[120px] animate-in fade-in"
            type="number"
            min="1"
            {...register('collect.collectLimit.limit')}
          />
        )}
      </Flex> */}
      {limitErrorMessage && (
        <Text size="2" color="red">
          {limitErrorMessage}
        </Text>
      )}
    </div>
  );
};
