import { PostMetadataSchemaId } from "@sigle/sdk";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Result } from "better-result";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";
import { useMultiStepToastStore } from "@/components/Shared/MultiStepToast";
import { EditorFormProvider } from "../EditorFormProvider";
import { useEditorStore } from "../store";
import { generateSigleMetadataFromForm } from "../utils";
import { PublishDialog } from "./PublishDialog";
import { waitForPublishCompletion } from "./wait-for-publish-completion";

const { mutateAsync, push, request, queryData } = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  push: vi.fn(),
  request: vi.fn(),
  // Data of the `useQuery` calls by path, none loaded by default.
  queryData: new Map<string, unknown>(),
}));

vi.mock(import("./PublishReview"), () => ({
  PublishReview: ({ onPublish }: { onPublish: () => void }) => (
    <button type="button" onClick={onPublish}>
      Publish now
    </button>
  ),
}));

vi.mock(import("./wait-for-publish-completion"), () => ({
  waitForPublishCompletion: vi.fn(),
}));

vi.mock(import("../utils"), () => ({
  generateSigleMetadataFromForm: vi
    .fn()
    .mockResolvedValue({ content: { content: "x" } }),
}));

vi.mock(import("@stacks/connect"), () => ({
  request,
}));

vi.mock(import("@/lib/sigle"), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    sigleApiClient: {
      ...actual.sigleApiClient,
      useMutation: vi.fn().mockReturnValue({ mutateAsync }),
      useQuery: vi.fn().mockImplementation((_method: string, path: string) => ({
        data: queryData.get(path),
      })),
    },
  };
});

vi.mock(import("next/navigation"), () => ({
  useRouter: vi.fn().mockReturnValue({ push }),
}));

vi.mock(import("posthog-js/react"), () => ({
  usePostHog: vi.fn().mockReturnValue({
    capture: vi.fn(),
  }),
}));

const waitForCompletion = vi.mocked(waitForPublishCompletion);

const post = {
  id: "d1",
  title: "A story title",
  content: "Some story content",
  metaTitle: null,
  metaDescription: null,
  coverImage: null,
  tags: [],
  canonicalUri: null,
  contentWarning: null,
  publishStatus: null,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const renderDialog = (publishStatus?: "processing") =>
  render(
    <EditorFormProvider
      post={{ ...post, publishStatus: publishStatus ?? null }}
    >
      <PublishDialog postId="d1" publishStatus={publishStatus ?? null} />
    </EditorFormProvider>,
  );

// Above the dialog's 1 s pause before it navigates.
const NAVIGATION_TIMEOUT = { timeout: 3000 };

describe("PublishDialog", () => {
  beforeEach(() => {
    request.mockResolvedValue({ signature: "sig" });
    mutateAsync.mockResolvedValue({ draftId: "d1", status: "pending" });
    useEditorStore.setState({ publishOpen: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    mutateAsync.mockReset();
    request.mockReset();
    waitForCompletion.mockReset();
    useEditorStore.getState().reset();
    useMultiStepToastStore.getState().reset();
    queryData.clear();
  });

  it("Retry after an accepted publish follows it without signing again", async () => {
    const user = userEvent.setup();
    waitForCompletion
      .mockResolvedValueOnce(
        Result.err({
          message: "Failed to check the publishing status, please try again",
        }),
      )
      .mockResolvedValueOnce(Result.ok({ postId: "tx1", arweaveTxId: "tx1" }));

    renderDialog();

    await user.click(screen.getByRole("button", { name: "Publish now" }));
    await user.click(await screen.findByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(expect.stringContaining("/p/tx1"));
    }, NAVIGATION_TIMEOUT);
    expect(request).toHaveBeenCalledTimes(1);
    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(waitForCompletion).toHaveBeenCalledTimes(2);
  });

  it("Retry after the server reports a failed publish signs again", async () => {
    const user = userEvent.setup();
    waitForCompletion
      .mockResolvedValueOnce(
        Result.err({ message: "Failed to publish post", failed: true }),
      )
      .mockResolvedValueOnce(Result.ok({ postId: "tx1", arweaveTxId: "tx1" }));

    renderDialog();

    await user.click(screen.getByRole("button", { name: "Publish now" }));
    await user.click(await screen.findByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(expect.stringContaining("/p/tx1"));
    }, NAVIGATION_TIMEOUT);
    expect(push).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledTimes(2);
    expect(mutateAsync).toHaveBeenCalledTimes(2);
  });

  it("Retry before the publish was accepted starts over", async () => {
    const user = userEvent.setup();
    mutateAsync.mockRejectedValueOnce(new Error("Server error"));
    waitForCompletion.mockResolvedValue(
      Result.ok({ postId: "tx1", arweaveTxId: "tx1" }),
    );

    renderDialog();

    await user.click(screen.getByRole("button", { name: "Publish now" }));
    await user.click(await screen.findByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(request).toHaveBeenCalledTimes(2);
    });
    expect(mutateAsync).toHaveBeenCalledTimes(2);
  });

  it("resumes a publish in progress when the draft opens", async () => {
    useEditorStore.setState({ publishOpen: false });
    waitForCompletion.mockResolvedValue(
      Result.ok({ postId: "tx2", arweaveTxId: "tx2" }),
    );

    renderDialog("processing");

    expect(
      await screen.findByText("Uploading data to Arweave"),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(expect.stringContaining("/p/tx2"));
    }, NAVIGATION_TIMEOUT);
    expect(request).not.toHaveBeenCalled();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("does not navigate after the dialog is gone", async () => {
    const { promise, resolve } =
      Promise.withResolvers<
        Awaited<ReturnType<typeof waitForPublishCompletion>>
      >();
    waitForCompletion.mockReturnValue(promise);

    const { unmount } = renderDialog("processing");

    await waitFor(() => {
      expect(waitForCompletion).toHaveBeenCalled();
    });
    unmount();
    resolve(Result.ok({ postId: "tx3", arweaveTxId: "tx3" }));

    // Longer than the dialog's 1 s pause before it navigates.
    await new Promise((done) => {
      setTimeout(done, 1500);
    });
    expect(push).not.toHaveBeenCalled();
  });

  it("does not follow or navigate when the dialog unmounts before the publish is accepted", async () => {
    const user = userEvent.setup();
    const { promise, resolve } = Promise.withResolvers<{
      draftId: string;
      status: string;
    }>();
    mutateAsync.mockReturnValue(promise);

    const { unmount } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Publish now" }));
    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalled();
    });
    unmount();
    resolve({ draftId: "d1", status: "pending" });
    await new Promise((done) => {
      setTimeout(done, 0);
    });

    expect(waitForCompletion).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("shows the progress when the draft starts publishing after mount", async () => {
    waitForCompletion.mockResolvedValue(
      Result.ok({ postId: "tx3", arweaveTxId: "tx3" }),
    );
    const dialog = (publishStatus: "processing" | null) => (
      <EditorFormProvider post={{ ...post, publishStatus }}>
        <PublishDialog postId="d1" publishStatus={publishStatus} />
      </EditorFormProvider>
    );

    const { rerender } = render(dialog(null));
    rerender(dialog("processing"));

    await waitFor(() => {
      expect(waitForCompletion).toHaveBeenCalled();
    });
    expect(
      screen.queryByRole("button", { name: "Publish now" }),
    ).not.toBeInTheDocument();
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(expect.stringContaining("/p/tx3"));
    }, NAVIGATION_TIMEOUT);
    expect(request).not.toHaveBeenCalled();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("stops before the signature when the post is over the plan's size limit", async () => {
    const user = userEvent.setup();
    // About 2.7 KB with the signature, over a 2 KiB limit.
    vi.mocked(generateSigleMetadataFromForm).mockResolvedValueOnce({
      $schema: PostMetadataSchemaId.LATEST,
      content: {
        id: "d1",
        title: "A story title",
        content: "a".repeat(2500),
        excerpt: "",
      },
    });
    queryData.set("/api/me/limits", {
      publish: { limit: 3, used: 0, resetsAt: null },
      publishMaxBytes: 2048,
    });
    queryData.set("/api/me", { id: "u1", address: "SP1", plan: "free" });

    renderDialog();

    await user.click(screen.getByRole("button", { name: "Publish now" }));

    expect(
      await screen.findByText(
        "This post is 3 KiB, over the 2 KiB limit of your plan. Shorten it, or upgrade to Pro to publish posts up to 1 MiB.",
      ),
    ).toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
    expect(mutateAsync).not.toHaveBeenCalled();
  });
});
