import { Card, Inset, Text } from "@radix-ui/themes";
import {
  IconCircleCheck,
  IconInfoCircle,
  IconPencil,
} from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
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
    <Card size="2">
      <Inset clip="padding-box" side="top" pb="current">
        <div className="border-b border-solid border-gray-4 bg-gray-2 p-4">
          <Text size="2" weight="medium">
            General settings
          </Text>
        </div>
      </Inset>
      <div className="-my-3">
        <div className="flex justify-between py-3">
          <Text size="2" color="gray">
            Meta SEO
          </Text>
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
              not configured <IconPencil size={12} />
            </Badge>
          )}
        </div>
        <div className="flex justify-between border-t border-solid border-gray-4 py-3">
          <Text size="2" color="gray">
            Cover image
          </Text>
          <Text size="2">
            {data.coverImage ? (
              <Badge>
                configured <IconCircleCheck size={12} />
              </Badge>
            ) : (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Badge variant="outline">
                      not configured <IconInfoCircle size={12} />
                    </Badge>
                  }
                />
                <TooltipContent>
                  Publications with a cover image tend to perform better
                </TooltipContent>
              </Tooltip>
            )}
          </Text>
        </div>
      </div>
    </Card>
  );
};
