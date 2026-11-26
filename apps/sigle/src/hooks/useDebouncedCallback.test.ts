import { act, renderHook } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";
import { useDebouncedCallback } from "./useDebouncedCallback";

const delay = 1000;

describe(useDebouncedCallback, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("runs the callback once with the last arguments after the delay", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, delay));

    act(() => {
      result.current("first");
      result.current("second");
    });
    act(() => {
      vi.advanceTimersByTime(delay);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("second");
  });

  it("runs a pending call immediately on unmount", () => {
    const callback = vi.fn();

    const { result, unmount } = renderHook(() =>
      useDebouncedCallback(callback, delay),
    );

    act(() => {
      result.current();
    });
    unmount();

    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(delay * 2);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does not run the callback on unmount without a pending call", () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useDebouncedCallback(callback, delay));

    unmount();

    expect(callback).not.toHaveBeenCalled();
  });

  it("runs a pending call on flush and not again when the timer fires", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, delay));

    act(() => {
      result.current();
      result.current.flush();
    });

    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(delay * 2);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("drops a pending call on cancel", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, delay));

    act(() => {
      result.current();
      result.current.cancel();
    });
    act(() => {
      vi.advanceTimersByTime(delay * 2);
    });
    act(() => {
      result.current.flush();
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
