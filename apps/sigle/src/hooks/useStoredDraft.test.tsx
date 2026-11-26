import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";
import { sigleApiClient } from "@/lib/sigle";
import { useStoredDraft } from "./useStoredDraft";

// The API client keeps the `fetch` it finds when its module loads, so the
// stub is in place before the imports run.
const { fetchStub } = vi.hoisted(() => {
  const fetchStub = vi.fn<typeof fetch>();
  vi.stubGlobal("fetch", fetchStub);

  return { fetchStub };
});

const cachedDraft = {
  id: "draft-id",
  title: "",
  content: "",
  metaTitle: null,
  metaDescription: null,
  coverImage: null,
  tags: [],
  canonicalUri: null,
  contentWarning: null,
  publishStatus: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const storedDraft = {
  ...cachedDraft,
  title: "Saved title",
  content: "Saved content",
  updatedAt: "2026-01-01T00:05:00.000Z",
};

describe(useStoredDraft, () => {
  it("waits for the stored draft instead of returning the cached one", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    // What an earlier visit of the editor left in the cache.
    queryClient.setQueryData(
      sigleApiClient.queryOptions("get", "/api/drafts/{draftId}", {
        params: { path: { draftId: cachedDraft.id } },
      }).queryKey,
      cachedDraft,
    );

    fetchStub.mockImplementation(async () => Response.json(storedDraft));

    const { result } = renderHook(() => useStoredDraft(cachedDraft.id), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    expect(result.current).toBeUndefined();

    await waitFor(() => {
      expect(result.current).toStrictEqual(storedDraft);
    });
  });
});
