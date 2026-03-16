import { Link } from "@radix-ui/themes";
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
import { appConfig } from "@/config";
import {
  formatUSDollar,
  useCurrencyFiatPrice,
} from "@/hooks/useCurrencyFiatPrice";
import type { EditorPostFormData } from "../../EditorFormProvider";

export const CollectPrice = () => {
  const { setValue, watch, register } = useFormContext<EditorPostFormData>();
  const type = watch("type");
  const watchCollectType = watch("collect.collectPrice.type");
  const watchCollectPrice = watch("collect.collectPrice.price");
  const { errors } = useFormState<EditorPostFormData>({
    name: ["collect.collectPrice.price"],
  });
  const { data: currencyFiatPrice } = useCurrencyFiatPrice("sBTC");

  const onSelectPriceChange = (value: string) => {
    if (value === "free") {
      setValue("collect.collectPrice.type", "free");
    } else {
      setValue("collect.collectPrice.type", "paid");
    }
  };

  return (
    <Field>
      <FieldLabel>Type</FieldLabel>
      <RadioGroup
        className="grid-cols-2"
        value={watchCollectType}
        onValueChange={onSelectPriceChange}
        disabled={type === "published"}
      >
        <FieldLabel htmlFor="collect-free">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Free Mint</FieldTitle>
            </FieldContent>
            <RadioGroupItem value="free" id="collect-free" />
          </Field>
        </FieldLabel>

        <FieldLabel htmlFor="collect-paid">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Paid Mint</FieldTitle>
            </FieldContent>
            <RadioGroupItem value="paid" id="collect-paid" />
          </Field>
        </FieldLabel>
      </RadioGroup>
      <FieldDescription className="text-xs">
        Earn protocol fees on each mint,{" "}
        <Link
          href={`${appConfig.docsUrl}/monetization#fee-structure`}
          target="_blank"
        >
          learn more
        </Link>
        .
      </FieldDescription>

      {watchCollectType === "paid" ? (
        <Field>
          <FieldLabel>Collection Price</FieldLabel>
          <InputGroup>
            <InputGroupInput
              className="w-full"
              placeholder="Free"
              type="number"
              disabled={type === "published"}
              {...register("collect.collectPrice.price")}
            />
            <InputGroupAddon align="inline-end">sBTC</InputGroupAddon>
          </InputGroup>
          {currencyFiatPrice && watchCollectPrice ? (
            <FieldDescription className="text-xs">
              ~
              {formatUSDollar.format(
                Number(watchCollectPrice) * Number(currencyFiatPrice),
              )}
            </FieldDescription>
          ) : null}
          {errors?.collect?.collectPrice?.price && (
            <FieldError>{errors.collect.collectPrice.price.message}</FieldError>
          )}
        </Field>
      ) : null}
    </Field>
  );
};
