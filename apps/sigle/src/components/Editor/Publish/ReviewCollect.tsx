import { IconButton, Inset, Text } from "@radix-ui/themes";
import { IconCards, IconPencil } from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
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
        <IconButton variant="ghost" color="gray" onClick={openCollectSettings}>
          <IconPencil size={16} />
        </IconButton>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between py-3">
          <Text size="2" color="gray">
            Type
          </Text>
          <Text size="2">
            {collectLimit ? (
              <>
                Limited edition{" "}
                <Badge variant="secondary">{collectLimit}</Badge>
              </>
            ) : (
              "Open edition"
            )}
          </Text>
        </div>
        <div className="flex justify-between border-t border-solid border-gray-4 py-3">
          <Text size="2" color="gray">
            Price
          </Text>
          <Text size="2">
            {data.collect.collectPrice.type === "free"
              ? "Free"
              : `${data.collect.collectPrice.price} sBTC`}
          </Text>
        </div>
      </CardContent>
    </Card>
  );
};
