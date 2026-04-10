import { IconHelpCircle } from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { env } from "@/env";
import { resolveImageUrl } from "@/lib/images";
import { prettifyUrl } from "@/lib/urls";
import type { EditorPostFormData } from "../EditorFormProvider";
import { useEditorStore } from "../store";

export const SeoPreview = () => {
  const editor = useEditorStore((state) => state.editor);
  const { watch } = useFormContext<EditorPostFormData>();
  const watchTitle = watch("title");
  const watchMetaTitle = watch("metaTitle");
  const watchMetaDescription = watch("metaDescription");
  const watchCoverImage = watch("coverImage");

  const metaTitle = watchMetaTitle || watchTitle;
  const metaDescription =
    watchMetaDescription || editor?.getText().slice(0, 90);
  const metaImage = watchCoverImage;

  return (
    <div>
      <p className="mb-1 flex items-center gap-1 text-sm">
        Preview
        <span className="text-muted-foreground">
          <Tooltip>
            <TooltipTrigger render={<IconHelpCircle size={16} />} />
            <TooltipContent>
              This is how the post will be displayed when sharing the link on
              social media
            </TooltipContent>
          </Tooltip>
        </span>
      </p>
      <Card size="sm" className="relative mx-auto pt-0!">
        {metaImage ? (
          <>
            <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
            {/* oxlint-disable-next-line no-img-element */}
            <img
              src={resolveImageUrl(metaImage)}
              alt="Cover social media preview"
              className="relative z-20 aspect-video w-full object-cover"
            />
          </>
        ) : null}
        <CardContent>
          <div className="truncate">{metaTitle}</div>
          <div className="mt-0.5 truncate text-muted-foreground">
            {metaDescription}
          </div>
          <div className="truncate text-sm text-muted-foreground">
            {prettifyUrl(env.NEXT_PUBLIC_APP_URL)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
