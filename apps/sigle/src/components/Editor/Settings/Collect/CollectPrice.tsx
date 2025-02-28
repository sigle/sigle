import {
  formatUSDollar,
  useCurrencyFiatPrice,
} from "@/hooks/useCurrencyFiatPrice";
import { Flex, Link, RadioCards, Text, TextField } from "@radix-ui/themes";
import { useFormContext, useFormState } from "react-hook-form";
import type { EditorPostFormData } from "../../EditorFormProvider";

export const CollectPrice = () => {
  const { setValue, watch, register } = useFormContext<EditorPostFormData>();
  const watchCollectType = watch("collect.collectPrice.type");
  const watchCollectPrice = watch("collect.collectPrice.price");
  const { errors } = useFormState<EditorPostFormData>({
    name: ["collect.collectPrice.price"],
  });
  const { data: currencyFiatPrice } = useCurrencyFiatPrice("STX");

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
              href="https://sigle-docs-next.vercel.app/monetization#fee-structure"
              target="_blank"
            >
              learn more
            </Link>
            .
          </Text>
        </div>
        {watchCollectType === "paid" ? (
          <>
            <Text as="p" size="2" weight="medium">
              Collection Price
            </Text>
            <Flex gap="2">
              <TextField.Root
                className="w-full"
                placeholder="Free"
                type="number"
                {...register("collect.collectPrice.price")}
              >
                <TextField.Slot side="right">STX</TextField.Slot>
              </TextField.Root>
            </Flex>
          </>
        ) : null}
        {currencyFiatPrice &&
        watchCollectType === "paid" &&
        watchCollectPrice ? (
          <Text size="1" color="gray">
            ~
            {formatUSDollar.format(
              Number(watchCollectPrice) * Number(currencyFiatPrice),
            )}
          </Text>
        ) : null}
        {errors?.collect?.collectPrice?.price && (
          <Text size="2" color="red">
            {errors.collect.collectPrice.price.message}
          </Text>
        )}
      </div>
    </div>
  );
};
