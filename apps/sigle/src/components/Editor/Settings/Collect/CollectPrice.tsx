import { Flex, Link, RadioCards, Text } from "@radix-ui/themes";
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
    <div>
      <div className="space-y-3">
        <Text as="p" size="2" weight="medium">
          Type
        </Text>
        <div className="space-y-2">
          <RadioCards.Root
            columns="2"
            value={watchCollectType}
            onValueChange={onSelectPriceChange}
            disabled={type === "published"}
          >
            <RadioCards.Item value="free">
              <Flex direction="column" width="100%">
                <Text weight="bold">Free Mint</Text>
              </Flex>
            </RadioCards.Item>
            <RadioCards.Item value="paid">
              <Flex direction="column" width="100%">
                <Text weight="bold">Paid Mint</Text>
              </Flex>
            </RadioCards.Item>
          </RadioCards.Root>
          <Text as="p" size="1" color="gray">
            Earn protocol fees on each mint,{" "}
            <Link
              href={`${appConfig.docsUrl}/monetization#fee-structure`}
              target="_blank"
            >
              learn more
            </Link>
            .
          </Text>
        </div>

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
              <FieldError>
                {errors.collect.collectPrice.price.message}
              </FieldError>
            )}
          </Field>
        ) : null}
      </div>
    </div>
  );
};
