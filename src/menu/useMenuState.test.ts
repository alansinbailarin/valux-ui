import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useMenuState } from "./useMenuState";

describe("useMenuState", () => {
  it("manages uncontrolled state from defaultOpen", () => {
    const { result } = renderHook(() => useMenuState({ defaultOpen: false }));

    expect(result.current[0]).toBe(false);
    act(() => result.current[1](true));
    expect(result.current[0]).toBe(true);
  });

  it("stays controlled and only notifies via onOpenChange", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() =>
      useMenuState({ open: false, onOpenChange }),
    );

    act(() => result.current[1](true));

    expect(result.current[0]).toBe(false);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
