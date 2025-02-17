import { useCallback } from "react";
import { toast } from "sonner";

export const useCopyToClipboard = () => {
  const copyToClipboard = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast("Copied to clipboard", {
      duration: 2000,
    });
  }, []);

  return { copyToClipboard };
};
