import { IconAlertCircle } from "@tabler/icons-react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { sigleApiClient } from "@/lib/sigle";
import type { EditorPostFormData } from "../EditorFormProvider";
import { useEditorStore } from "../store";

const saveStateLabels = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
};

// Browsers reject keepalive requests above a 64 KiB in-flight quota, so we keep
// a margin. Larger drafts are sent as a normal request while the
// `beforeunload` prompt keeps the page open.
const KEEPALIVE_MAX_BYTES = 60 * 1024;

export const EditorSave = () => {
  const params = useParams<{ postId: string }>();
  const postId = params.postId;
  const searchParams = useSearchParams();
  const forceSave = searchParams.get("forceSave") === "true";

  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "error" | "saved"
  >("idle");

  const [saveError, setSaveError] = useState<string | null>(null);

  // Incremented on every change, so a save can tell whether it is the latest.
  const changeCountRef = useRef(0);
  // True while the save is dispatched because the writer is leaving the page.
  const leavingRef = useRef(false);

  const { watch, getValues } = useFormContext<EditorPostFormData>();
  const type = watch("type");

  const { mutate: updatePost } = sigleApiClient.useMutation(
    "patch",
    "/api/drafts/{draftId}",
  );

  const editor = useEditorStore((state) => state.editor);

  const onAutoSave = useDebouncedCallback(
    () => {
      if (!editor) {
        return;
      }
      const saveCount = changeCountRef.current;
      const values = getValues();

      const body = {
        title: values.title,
        content: values.content,
        metaTitle: values.metaTitle || null,
        metaDescription: values.metaDescription || null,
        coverImage: values.coverImage || null,
        tags: values.tags ?? [],
        canonicalUri: values.canonicalUri || null,
        contentWarning: values.contentWarning ?? null,
      };

      const keepalive =
        leavingRef.current &&
        new Blob([JSON.stringify(body)]).size <= KEEPALIVE_MAX_BYTES;

      updatePost(
        {
          params: {
            path: {
              draftId: postId,
            },
          },
          body,
          keepalive,
        },
        {
          // A newer change has a save queued or in flight, and that save
          // reports the outcome, so this one must not leave the saving state.
          onSuccess: () => {
            if (saveCount !== changeCountRef.current) {
              return;
            }
            setSaveState("saved");
          },
          onError: (error) => {
            if (saveCount !== changeCountRef.current) {
              return;
            }
            // A 409 explains why the draft cannot be saved right now, such as
            // a publish in progress.
            setSaveError(error.message);
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
      changeCountRef.current += 1;
      // The effect starts a save, which the state shows.
      // oxlint-disable-next-line react/set-state-in-effect
      setSaveState("saving");
      onAutoSave();
    }
  }, [forceSave, editor, onAutoSave]);

  // When the form is changing, we start a timer to save the post
  // We wait for the editor to be ready before listening to changes
  useEffect(() => {
    if (!editor) {
      return;
    }

    const subscription = watch(() => {
      if (type === "published") {
        return;
      }
      changeCountRef.current += 1;
      setSaveState("saving");
      onAutoSave();
    });

    return () => subscription.unsubscribe();
  }, [watch, type, editor, onAutoSave]);

  // Without this, the last 2 seconds of edits would be lost when the tab closes.
  // The guard covers both a pending save and a failed one, whose changes the
  // server doesn't have.
  useEffect(() => {
    if (saveState !== "saving" && saveState !== "error") {
      return;
    }

    // `flush()` runs the save synchronously, so the flag covers exactly that
    // dispatch.
    const flushOnLeave = () => {
      leavingRef.current = true;

      try {
        // A failed save has nothing scheduled, so schedule a retry with the
        // current values for `flush()` to dispatch.
        if (saveState === "error") {
          onAutoSave();
        }
        onAutoSave.flush();
      } finally {
        leavingRef.current = false;
      }
    };

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      flushOnLeave();
      event.preventDefault();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushOnLeave();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [saveState, onAutoSave]);

  if (saveState === "error") {
    return (
      <p
        role="alert"
        className="flex min-w-0 items-center gap-1.5 text-sm text-destructive"
      >
        <IconAlertCircle size={14} className="shrink-0" />
        <span className="truncate">
          {saveError ?? "Error saving, please try again"}
        </span>
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      {saveStateLabels[saveState]}
    </p>
  );
};
