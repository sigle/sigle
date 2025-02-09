import { Flex, RadioCards, Text, TextField } from '@radix-ui/themes';
import { useFormContext, useFormState } from 'react-hook-form';
import type { EditorPostFormData } from '../../EditorFormProvider';

export const CollectEdition = () => {
  const { setValue, watch, register } = useFormContext<EditorPostFormData>();
  const watchCollectLimitType = watch('collect.collectLimit.type');
  const watchCollectLimitLimit = watch('collect.collectLimit.limit');
  const { errors } = useFormState<EditorPostFormData>({
    name: ['collect.collectLimit.type', 'collect.collectLimit.limit'],
  });

  const onEditionChange = (value: typeof watchCollectLimitType) => {
    setValue('collect.collectLimit.type', value, {
      shouldValidate: true,
    });
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
        value={watchCollectLimitType}
        onValueChange={onEditionChange}
      >
        <RadioCards.Item value="open">
          <Flex direction="column" width="100%">
            <Text weight="bold">Open edition</Text>
            <Text>∞</Text>
          </Flex>
        </RadioCards.Item>
        <RadioCards.Item value="fixed">
          <Flex direction="column" width="100%">
            <Text weight="bold">Limited edition</Text>
            <Text>0/{watchCollectLimitLimit}</Text>
          </Flex>
        </RadioCards.Item>
      </RadioCards.Root>
      {watchCollectLimitType === 'fixed' ? (
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
      ) : null}
      {limitErrorMessage && (
        <Text size="2" color="red">
          {limitErrorMessage}
        </Text>
      )}
    </div>
  );
};
