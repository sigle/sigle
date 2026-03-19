export const HomeFeatures = () => {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="grid grid-cols-1 gap-x-6 md:grid-cols-3">
        <div className="flex flex-col items-center gap-4 rounded-3 bg-muted p-6 text-center">
          <h3 className="text-lg font-bold">⛓️ Write on-chain</h3>
          <p className="text-balance text-muted-foreground">
            Inscribe your words as <span className="font-medium">Ordinals</span>{" "}
            to make them live forever.
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 rounded-3 bg-muted p-6 text-center">
          <h3 className="text-lg font-bold">💰 Earn Bitcoin</h3>
          <p className="text-balance text-muted-foreground">
            Turn readers into collectors with direct{" "}
            <span className="font-medium">sBTC</span> payments to your wallet.
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 rounded-3 bg-muted p-6 text-center">
          <h3 className="text-lg font-bold">⚡ Full Control</h3>
          <p className="text-balance text-muted-foreground">
            Your content, your rules. Build anything with our{" "}
            <span className="font-medium">API, SDKs, and developer tools</span>.
          </p>
        </div>
      </section>
    </div>
  );
};
