import {
  IconCircleCheck,
  IconInfoCircle,
  IconPencil,
} from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { EditorPostFormData } from "../EditorFormProvider";
import { useEditorStore } from "../store";

export const PublishReviewGeneral = () => {
  const { getValues } = useFormContext<EditorPostFormData>();
  const setMenuOpen = useEditorStore((state) => state.setMenuOpen);
  const setPublishOpen = useEditorStore((state) => state.setPublishOpen);
  const data = getValues();

  const isMetaConfigured = data.metaTitle && data.metaDescription;

  const openMetaSettings = () => {
    setPublishOpen(false);
    setMenuOpen("meta");
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>General settings</CardTitle>
      </CardHeader>
      <CardContent className="-my-3">
        <div className="flex justify-between py-3">
          <p className="text-sm text-muted-foreground">Meta SEO</p>
          {isMetaConfigured ? (
            <Badge>
              configured <IconCircleCheck size={12} />
            </Badge>
          ) : (
            <Badge
              className="cursor-pointer"
              variant="outline"
              onClick={openMetaSettings}
            >
              <IconPencil size={12} /> Not configured
            </Badge>
          )}
        </div>
        <div className="flex justify-between border-t border-solid border-border py-3">
          <p className="text-sm text-muted-foreground">Cover image</p>
          <p className="text-sm">
            {data.coverImage ? (
              <Badge>
                configured <IconCircleCheck size={12} />
              </Badge>
            ) : (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Badge variant="outline">
                      <IconInfoCircle size={12} /> Not configured
                    </Badge>
                  }
                />
                <TooltipContent>
                  Publications with a cover image tend to perform better
                </TooltipContent>
              </Tooltip>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
