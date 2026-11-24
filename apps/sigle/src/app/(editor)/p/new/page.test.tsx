import { render } from "@testing-library/react";
import { StrictMode } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import PostCreate from "./page";

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));

vi.mock(import("@/lib/sigle"), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    sigleApiClient: {
      ...actual.sigleApiClient,
      useMutation: vi.fn().mockReturnValue({ mutate }),
    },
  };
});

vi.mock(import("next/navigation"), () => ({
  useRouter: vi.fn().mockReturnValue({ push: vi.fn() }),
}));

describe("new post page", () => {
  it("creates one draft when React runs its effects twice", () => {
    render(
      <StrictMode>
        <PostCreate />
      </StrictMode>,
    );

    expect(mutate.mock.calls).toStrictEqual([[{ body: {} }]]);
  });
});
