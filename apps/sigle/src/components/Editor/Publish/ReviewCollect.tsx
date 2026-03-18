import { IconCards, IconPencil } from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EditorPostFormData } from "../EditorFormProvider";
import { useEditorStore } from "../store";

export const PublishReviewCollect = () => {
  const { getValues } = useFormContext<EditorPostFormData>();
  const setMenuOpen = useEditorStore((state) => state.setMenuOpen);
  const setPublishOpen = useEditorStore((state) => state.setPublishOpen);
  const data = getValues();

  const collectLimit =
    data.collect.collectLimit.type === "fixed" &&
    data.collect.collectLimit.limit
      ? data.collect.collectLimit.limit
      : undefined;
  const isCollectEnabled = false;

  const openCollectSettings = () => {
    setPublishOpen(false);
    setMenuOpen("collect");
  };

  if (!isCollectEnabled) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between border-b">
        <CardTitle className="flex items-center gap-2">
          <IconCards size={20} />
          Collect settings
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Edit collect settings"
          onClick={openCollectSettings}
        >
          <IconPencil size={16} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between py-3">
          <p className="text-sm text-muted-foreground">Type</p>
          <p className="text-sm">
            {collectLimit ? (
              <>
                Limited edition{" "}
                <Badge variant="secondary">{collectLimit}</Badge>
              </>
            ) : (
              "Open edition"
            )}
          </p>
        </div>
        <div className="flex justify-between border-t border-solid border-gray-4 py-3">
          <p className="text-sm text-muted-foreground">Price</p>
          <p className="text-sm">
            {data.collect.collectPrice.type === "free"
              ? "Free"
              : `${data.collect.collectPrice.price} sBTC`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
