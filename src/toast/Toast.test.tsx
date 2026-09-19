import { act, fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Toaster, toast } from "./index";
import { getToasts, removeToast } from "./toastStore";

afterEach(() => {
  for (const item of [...getToasts()]) removeToast(item.id);
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function reduceMotion() {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
}

describe("Toast", () => {
  it("renders from the imperative API with tone semantics (status vs alert)", () => {
    reduceMotion();
    render(<Toaster maxVisible={2} />);

    act(() => {
      toast({ title: "Guardado", description: "Tu nota está a salvo.", tone: "success" });
      toast({ title: "Falló la red", tone: "danger" });
    });

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Guardado");
    expect(status).toHaveTextContent("Tu nota está a salvo.");
    expect(status).toHaveAttribute("data-vx-tone", "success");
    expect(screen.getByRole("alert")).toHaveTextContent("Falló la red");
  });

  it("auto-dismisses after its duration; hovering pauses the timer", () => {
    reduceMotion();
    vi.useFakeTimers();
    render(<Toaster />);
    act(() => {
      toast({ title: "Copiado", duration: 2000 });
    });
    const card = screen.getByRole("status");

    fireEvent.pointerEnter(card);
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByRole("status")).toBeInTheDocument(); // paused

    fireEvent.pointerLeave(card);
    act(() => vi.advanceTimersByTime(2100));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("click dismisses; duration 0 is sticky", () => {
    reduceMotion();
    vi.useFakeTimers();
    render(<Toaster />);
    act(() => {
      toast({ title: "Persistente", duration: 0 });
    });
    act(() => vi.advanceTimersByTime(10000));
    const card = screen.getByRole("status");
    expect(card).toBeInTheDocument();

    fireEvent.click(card);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("queues FIFO: one on stage at a time; the next enters when it leaves", () => {
    reduceMotion();
    vi.useFakeTimers();
    render(<Toaster />);
    act(() => {
      toast({ title: "Primero", duration: 1000 });
      toast({ title: "Segundo", duration: 1000 });
    });

    // Only the oldest is visible; the second waits (its timer NOT running).
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent("Primero");

    act(() => vi.advanceTimersByTime(1100));
    expect(screen.getByRole("status")).toHaveTextContent("Segundo");

    act(() => vi.advanceTimersByTime(1100));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("coalesces an identical re-fire into a timer refresh, not a duplicate", () => {
    reduceMotion();
    vi.useFakeTimers();
    render(<Toaster />);
    act(() => {
      toast({ title: "Copiado", duration: 1000 });
    });
    act(() => vi.advanceTimersByTime(700));
    act(() => {
      toast({ title: "Copiado", duration: 1000 }); // same toast again
    });

    expect(screen.getAllByRole("status")).toHaveLength(1);
    // Timer was refreshed: 700ms later it is still on stage...
    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByRole("status")).toBeInTheDocument();
    // ...and it expires on the refreshed schedule.
    act(() => vi.advanceTimersByTime(400));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("maxVisible>1 shows a small stack, oldest nearest the edge", () => {
    reduceMotion();
    render(<Toaster position="top-right" maxVisible={3} />);
    act(() => {
      toast("Primero");
      toast("Segundo");
      toast("Tercero");
      toast("Cuarto");
    });
    const cards = screen.getAllByRole("status");
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveTextContent("Primero");
    expect(cards[2]).toHaveTextContent("Tercero");
  });

  it("action button runs its handler, dismisses, and is tabbable", () => {
    reduceMotion();
    const onClick = vi.fn();
    render(<Toaster />);
    act(() => {
      toast({ title: "Nota archivada", action: { label: "Deshacer", onClick } });
    });

    const action = screen.getByRole("button", { name: "Deshacer" });
    expect(action).toHaveAttribute("tabindex", "0");
    fireEvent.click(action);
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("toast.dismiss() with no id clears everything", () => {
    reduceMotion();
    render(<Toaster maxVisible={3} />);
    act(() => {
      toast("Uno");
      toast("Dos");
    });
    expect(screen.getAllByRole("status")).toHaveLength(2);
    act(() => toast.dismiss());
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("keeps a PERSISTENT polite live region that mirrors the latest toast", () => {
    reduceMotion();
    render(<Toaster />);
    const announcer = document.querySelector("[data-vx-announcer]");
    expect(announcer).toHaveAttribute("aria-live", "polite");
    expect(announcer).toHaveTextContent("");

    act(() => {
      toast({ title: "Guardado", description: "Todo bien." });
    });
    expect(announcer).toHaveTextContent("Guardado. Todo bien.");
  });

  it("queued toasts PEEK behind the stage card and promote in order", () => {
    reduceMotion();
    vi.useFakeTimers();
    render(<Toaster />);
    act(() => {
      toast({ title: "Uno", duration: 1000 });
      toast({ title: "Dos", duration: 1000 });
      toast({ title: "Tres", duration: 1000 });
    });

    // One on stage; the queue waits behind as COMPLETE aria-hidden cards.
    expect(screen.getAllByRole("status")).toHaveLength(1);
    const peeks = document.querySelectorAll("[data-vx-peek]");
    expect(peeks).toHaveLength(2);
    expect(peeks[0]).toHaveAttribute("aria-hidden", "true");
    expect(peeks[0]).toHaveTextContent("Dos");
    expect(peeks[1]).toHaveTextContent("Tres");

    act(() => vi.advanceTimersByTime(1100));
    // The waiting card PASSES TO THE FRONT (no re-entrance): same toast,
    // now interactive, marked with the promoted phase.
    const front = screen.getByRole("status");
    expect(front).toHaveTextContent("Dos");
    expect(front).toHaveAttribute("data-vx-phase", "promoted");
    expect(document.querySelectorAll("[data-vx-peek]")).toHaveLength(1);
  });

  it("has no accessibility violations", async () => {
    reduceMotion();
    const { baseElement } = render(<Toaster />);
    act(() => {
      toast({ title: "Listo", description: "Todo bien.", tone: "info" });
    });
    const results = await axe(baseElement, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toHaveLength(0);
  });
});
