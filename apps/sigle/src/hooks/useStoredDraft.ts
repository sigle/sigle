import { sigleApiClient } from "@/lib/sigle";

/**
 * The draft as the API stores it now, undefined until it is fetched.
 *
 * The editor fills its form once, from the draft it is first given. A draft
 * cached by an earlier visit is the one that visit loaded, before its edits:
 * opened on it, the editor shows the old text and its next autosave stores
 * that text over the newer one. So this never returns the cached draft, it
 * waits for the fetch started when the component mounts.
 */
export const useStoredDraft = (draftId: string) => {
  const { data, isFetchedAfterMount } = sigleApiClient.useQuery(
    "get",
    "/api/drafts/{draftId}",
    { params: { path: { draftId } } },
    // Errors go to the error boundary, such as a draft that does not exist.
    { refetchOnMount: "always", throwOnError: true },
  );

  return isFetchedAfterMount ? data : undefined;
};
