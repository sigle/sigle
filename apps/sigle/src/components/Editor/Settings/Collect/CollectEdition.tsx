import { Flex, RadioCards, Text } from "@radix-ui/themes";
import { useFormContext, useFormState } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import type { EditorPostFormData } from "../../EditorFormProvider";

export const CollectEdition = () => {
  const { setValue, watch, register } = useFormContext<EditorPostFormData>();
  const type = watch("type");
  const watchCollectLimitType = watch("collect.collectLimit.type");
  const watchCollectLimitLimit = watch("collect.collectLimit.limit");
  const { errors } = useFormState<EditorPostFormData>({
    name: ["collect.collectLimit.type", "collect.collectLimit.limit"],
  });

  const onEditionChange = (value: typeof watchCollectLimitType) => {
    setValue("collect.collectLimit.type", value, {
      shouldValidate: true,
    });
  };

  // oxlint-disable-next-line no-explicit-any
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
        disabled={type === "published"}
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
      {watchCollectLimitType === "fixed" ? (
        <Field>
          <FieldLabel>Number of editions</FieldLabel>
          <FieldDescription className="text-xs">
            After publishing, the edition count can only be reduced.
          </FieldDescription>
          <InputGroup>
            <InputGroupInput
              className="w-full"
              type="number"
              min="1"
              {...register("collect.collectLimit.limit")}
            />
            <InputGroupAddon align="inline-end">editions</InputGroupAddon>
          </InputGroup>
          {limitErrorMessage && <FieldError>{limitErrorMessage}</FieldError>}
        </Field>
      ) : null}
    </div>
  );
};
