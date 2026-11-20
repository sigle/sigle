import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";
import { EditorCoverImage } from "./EditorCoverImage";
import { EditorFormProvider } from "./EditorFormProvider";

vi.mock(import("@/lib/sigle"), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    sigleApiClient: {
      ...actual.sigleApiClient,
      useMutation: vi.fn().mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
      }),
    },
  };
});

vi.mock(import("next/navigation"), () => ({
  useParams: vi.fn().mockReturnValue({ postId: "test-post-id" }),
}));

vi.mock(import("posthog-js/react"), () => ({
  usePostHog: vi.fn().mockReturnValue({
    capture: vi.fn(),
  }),
}));

const defaultPost = {
  id: "test-id",
  title: "",
  content: "",
  metaTitle: null,
  metaDescription: null,
  coverImage: null,
  tags: [],
  canonicalUri: null,
  publishStatus: null,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const coverImage = "https://cdn.example.com/cover.webp";

describe("editor cover image", () => {
  it("should offer to add a cover on the pro plan", () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorCoverImage canUploadImages />
      </EditorFormProvider>,
    );

    expect(
      screen.queryByRole("button", { name: /add cover image/i }),
    ).not.toBeNull();
  });

  it("should not offer to add a cover on the free plan", () => {
    const { container } = render(
      <EditorFormProvider post={defaultPost}>
        <EditorCoverImage />
      </EditorFormProvider>,
    );

    expect(container.innerHTML).toBe("");
  });

  it("should keep an existing cover on the free plan", () => {
    render(
      <EditorFormProvider post={{ ...defaultPost, coverImage }}>
        <EditorCoverImage />
      </EditorFormProvider>,
    );

    expect(
      screen.getByRole("img", { name: "Cover post" }).getAttribute("src"),
    ).toBe(coverImage);
  });
});
