import { act, fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContextMenu } from "./index";

function reduceMotion() {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
}

function renderContextMenu(onSelect = vi.fn()) {
  render(
    <ContextMenu>
      <ContextMenu.Trigger>
        <p>Área de la nota</p>
      </ContextMenu.Trigger>
      <ContextMenu.Content aria-label="Acciones de nota">
        <ContextMenu.Item onSelect={onSelect}>Renombrar</ContextMenu.Item>
        <ContextMenu.Item destructive>Eliminar</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>,
  );
  return onSelect;
}

describe("ContextMenu", () => {
  beforeEach(() => reduceMotion());

  it("opens at right-click and runs items like a Menu", () => {
    const onSelect = renderContextMenu();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    fireEvent.contextMenu(screen.getByText("Área de la nota"), {
      clientX: 120,
      clientY: 80,
    });
    expect(screen.getByRole("menu")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("menuitem", { name: "Renombrar" }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("places the invisible anchor under the pointer", () => {
    renderContextMenu();
    fireEvent.contextMenu(screen.getByText("Área de la nota"), {
      clientX: 200,
      clientY: 150,
    });
    const anchor = document.querySelector<HTMLElement>("[data-vx-context-anchor]");
    expect(anchor).not.toBeNull();
    expect(anchor!.style.left).toBe("188px");
    expect(anchor!.style.top).toBe("138px");
  });

  it("long-press opens on touch; a short tap does not", () => {
    vi.useFakeTimers();
    renderContextMenu();
    const area = screen.getByText("Área de la nota");

    fireEvent.pointerDown(area, { pointerType: "touch", clientX: 50, clientY: 60 });
    fireEvent.pointerUp(area, { pointerType: "touch" });
    act(() => vi.advanceTimersByTime(600));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    fireEvent.pointerDown(area, { pointerType: "touch", clientX: 50, clientY: 60 });
    act(() => vi.advanceTimersByTime(600));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("moving the finger cancels the long press (scroll wins)", () => {
    vi.useFakeTimers();
    renderContextMenu();
    const area = screen.getByText("Área de la nota");
    fireEvent.pointerDown(area, { pointerType: "touch", clientX: 50, clientY: 60 });
    fireEvent.pointerMove(area, { pointerType: "touch", clientX: 50, clientY: 90 });
    act(() => vi.advanceTimersByTime(600));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("has no accessibility violations while open", async () => {
    renderContextMenu();
    fireEvent.contextMenu(screen.getByText("Área de la nota"), {
      clientX: 10,
      clientY: 10,
    });
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results.violations).toHaveLength(0);
  });
});
