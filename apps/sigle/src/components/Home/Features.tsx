import { IconCode, IconCurrencyBitcoin, IconLock } from "@tabler/icons-react";

export const HomeFeatures = () => {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="grid grid-cols-1 gap-x-4 md:grid-cols-3">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-secondary/50 p-5 text-center">
          <IconLock className="mt-3 size-8 text-muted-foreground" />
          <h3 className="text-2xl font-semibold tracking-tight">
            Write on-chain
          </h3>
          <p className="text-sm text-balance text-muted-foreground">
            Inscribe your words as <span className="font-medium">Ordinals</span>{" "}
            to make them live forever.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-2xl bg-secondary/50 p-5 text-center">
          <IconCurrencyBitcoin className="mt-3 size-8 text-muted-foreground" />
          <h3 className="text-2xl font-semibold tracking-tight">
            Earn Bitcoin
          </h3>
          <p className="text-sm text-balance text-muted-foreground">
            Turn readers into collectors with direct{" "}
            <span className="font-medium">sBTC</span> payments to your wallet.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-2xl bg-secondary/50 p-5 text-center">
          <IconCode className="mt-3 size-8 text-muted-foreground" />
          <h3 className="text-2xl font-semibold tracking-tight">
            Full Control
          </h3>
          <p className="text-sm text-balance text-muted-foreground">
            Your content, your rules. Build anything with our{" "}
            <span className="font-medium">API, SDKs, and developer tools</span>.
          </p>
        </div>
      </section>
    </div>
  );
};
