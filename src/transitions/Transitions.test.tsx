import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Hero, TransitionLink, useViewTransition } from "./index";

const push = vi.fn();
const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
  usePathname: () => "/somewhere",
}));

// TS's dom lib already types startViewTransition; go through unknown to
// stub/remove it freely in jsdom (where it doesn't exist).
const vtDoc = document as unknown as { startViewTransition?: unknown };

afterEach(() => {
  push.mockClear();
  replace.mockClear();
  delete vtDoc.startViewTransition;
  document.documentElement.removeAttribute("data-vx-transition");
  vi.unstubAllGlobals();
});

function stubViewTransition() {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
  const start = vi.fn((update: () => Promise<void> | void) => {
    void update();
    return { finished: Promise.resolve() };
  });
  vtDoc.startViewTransition = start;
  return start;
}

describe("view transitions", () => {
  it("Hero stamps the shared view-transition-name", () => {
    render(<Hero name="card-1">Contenido</Hero>);
    expect(screen.getByText("Contenido").style.viewTransitionName).toBe("card-1");
  });

  it("TransitionLink falls back to a plain push without the API", () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
    render(<TransitionLink href="/detalle">Ir</TransitionLink>);
    fireEvent.click(screen.getByText("Ir"));
    expect(push).toHaveBeenCalledWith("/detalle");
  });

  it("wraps the navigation in startViewTransition and stamps the preset", () => {
    const start = stubViewTransition();
    render(
      <TransitionLink href="/detalle" transition="slide">
        Ir
      </TransitionLink>,
    );
    fireEvent.click(screen.getByText("Ir"));
    expect(start).toHaveBeenCalledOnce();
    expect(document.documentElement.getAttribute("data-vx-transition")).toBe("slide");
    expect(push).toHaveBeenCalledWith("/detalle");
  });

  it("reduced motion skips the transition entirely", () => {
    const start = vi.fn();
    vtDoc.startViewTransition = start;
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
    render(<TransitionLink href="/detalle">Ir</TransitionLink>);
    fireEvent.click(screen.getByText("Ir"));
    expect(start).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/detalle");
  });

  it("useViewTransition morphs same-page state updates", () => {
    const start = stubViewTransition();
    function Demo() {
      const transition = useViewTransition();
      return (
        <button type="button" onClick={() => transition(() => {})}>
          Reordenar
        </button>
      );
    }
    render(<Demo />);
    fireEvent.click(screen.getByRole("button", { name: "Reordenar" }));
    expect(start).toHaveBeenCalledOnce();
  });
});
