import { CollectEdition } from "./Collect/CollectEdition";
import { CollectPrice } from "./Collect/CollectPrice";
import { DialogTitleGoBack } from "./DialogTitle";

export const CollectSettings = () => {
  return (
    <div className="animate-in fade-in slide-in-from-right-5">
      <DialogTitleGoBack
        title="NFT collection"
        description="Edit your NFT collection settings"
      />

      <div className="space-y-6">
        <CollectPrice />
        <CollectEdition />
      </div>
    </div>
  );
};
