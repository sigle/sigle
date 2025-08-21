import { Callout, Text } from "@radix-ui/themes";
import { parseBTC } from "@sigle/sdk";
import { IconInfoCircle } from "@tabler/icons-react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { sigleApiClient } from "@/lib/sigle";
import type { EditorPostFormData } from "../EditorFormProvider";
import { useEditorStore } from "../store";

export const EditorSave = () => {
  const params = useParams();
  const postId = params.postId as string;
  const searchParams = useSearchParams();
  const forceSave = searchParams.get("forceSave") === "true";
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "error" | "saved"
  >("idle");
  const { watch, getValues } = useFormContext<EditorPostFormData>();
  const type = watch("type");
  const { mutate: updatePost } = sigleApiClient.useMutation(
    "post",
    "/api/protected/drafts/{draftId}/update",
  );
  const editor = useEditorStore((state) => state.editor);

  const onAutoSave = useDebouncedCallback(
    () => {
      if (!editor) return;
      const values = getValues();
      updatePost(
        {
          params: {
            path: {
              draftId: postId,
            },
          },
          body: {
            ...values,
            collect: {
              ...values.collect,
              collectPrice: {
                ...values.collect.collectPrice,
                price: Number(
                  parseBTC(String(values.collect.collectPrice.price)),
                ),
              },
            },
          },
        },
        {
          onSuccess: () => {
            setSaveState("saved");
          },
          onError: () => {
            setSaveState("error");
          },
        },
      );
    },
    2000,
    [editor],
  );

  // Force save the post on mount if forceSave is true
  useEffect(() => {
    if (forceSave && editor) {
      setSaveState("saving");
      onAutoSave();
    }
  }, [forceSave, editor, onAutoSave]);

  // When the form is changing, we start a timer to save the post
  // We wait for the editor to be ready before listening to changes
  useEffect(() => {
    if (!editor) return;
    const subscription = watch(() => {
      if (type === "published") return;
      setSaveState("saving");
      onAutoSave();
    });
    return () => subscription.unsubscribe();
  }, [watch, type, editor, onAutoSave]);

  if (saveState === "error") {
    return (
      <Callout.Root color="red" size="1">
        <Callout.Icon>
          <IconInfoCircle />
        </Callout.Icon>
        <Callout.Text>Error Saving, please try again</Callout.Text>
      </Callout.Root>
    );
  }

  return (
    <Text size="2">
      {saveState === "idle"
        ? ""
        : saveState === "saved"
          ? "Saved"
          : "Saving..."}
    </Text>
  );
};
