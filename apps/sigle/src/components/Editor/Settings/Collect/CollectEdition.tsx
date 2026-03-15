import { useFormContext, useFormState } from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
    <Field>
      <FieldLabel>Edition</FieldLabel>
      <RadioGroup
        className="grid-cols-2"
        value={watchCollectLimitType}
        onValueChange={onEditionChange}
        disabled={type === "published"}
      >
        <FieldLabel htmlFor="collect-open">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Open edition</FieldTitle>
              <FieldDescription>∞</FieldDescription>
            </FieldContent>
            <RadioGroupItem value="open" id="collect-open" />
          </Field>
        </FieldLabel>

        <FieldLabel htmlFor="collect-fixed">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Limited edition</FieldTitle>
              <FieldDescription>0/{watchCollectLimitLimit}</FieldDescription>
            </FieldContent>
            <RadioGroupItem value="fixed" id="collect-fixed" />
          </Field>
        </FieldLabel>
      </RadioGroup>

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
    </Field>
  );
};
