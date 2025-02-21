import { CollectEdition } from "./Collect/CollectEdition";
import { CollectPrice } from "./Collect/CollectPrice";
import { DialogTitleGoBack } from "./DialogTitle";

export const CollectSettings = () => {
  return (
    <div className="animate-in fade-in slide-in-from-right-5">
      <DialogTitleGoBack
        title="Collect settings"
        description="Edit your collect settings"
      />

      <div className="space-y-6">
        <CollectPrice />
        <CollectEdition />
      </div>
    </div>
  );
};
