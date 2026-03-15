import { Link, RadioCards, Text, TextField } from "@radix-ui/themes";
import { useFormContext, useFormState } from "react-hook-form";
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
              <div className="flex w-full flex-col">
                <Text weight="bold">Free Mint</Text>
              </div>
            </RadioCards.Item>
            <RadioCards.Item value="paid">
              <div className="flex w-full flex-col">
                <Text weight="bold">Paid Mint</Text>
              </div>
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
          <>
            <Text as="p" size="2" weight="medium">
              Collection Price
            </Text>
            <div className="flex gap-2">
              <TextField.Root
                className="w-full"
                placeholder="Free"
                type="number"
                disabled={type === "published"}
                {...register("collect.collectPrice.price")}
              >
                <TextField.Slot side="right">sBTC</TextField.Slot>
              </TextField.Root>
            </div>
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
