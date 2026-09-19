import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Toaster, toast } from "./index";
import { getToasts, removeToast } from "./toastStore";

afterEach(() => {
  for (const item of [...getToasts()]) removeToast(item.id);
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("toast.promise", () => {
  it("morphs the loading pill into success, then error tone on reject", async () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
    render(<Toaster />);

    let resolveIt!: () => void;
    const pending = new Promise<void>((resolve) => (resolveIt = resolve));
    act(() => {
      void toast.promise(pending, {
        loading: "Enviando…",
        success: "Enviado",
        error: "Falló",
      });
    });
    expect(screen.getByRole("status")).toHaveTextContent("Enviando…");
    expect(document.querySelector(".vx-toast__spinner")).toBeInTheDocument();

    await act(async () => {
      resolveIt();
      await pending;
    });
    const card = screen.getByRole("status");
    expect(card).toHaveTextContent("Enviado");
    expect(card).toHaveAttribute("data-vx-tone", "success");
    expect(document.querySelector(".vx-toast__spinner")).not.toBeInTheDocument();
    // The settle replays the liquid generation on the same card.
    expect(card).toHaveAttribute("data-vx-phase", "updating");

    act(() => toast.dismiss());
    const failing = Promise.reject(new Error("nope"));
    act(() => {
      void toast.promise(failing, {
        loading: "Guardando…",
        success: "Listo",
        error: (err) => ({ title: "Falló", description: (err as Error).message }),
      });
    });
    await act(async () => {
      await failing.catch(() => {});
    });
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Falló");
    expect(alert).toHaveTextContent("nope");
  });
});
