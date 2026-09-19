import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Drawer } from "./index";
import { Button } from "../button";

function reduceMotion() {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
}

function renderDrawer(side: "left" | "right" = "right") {
  render(
    <Drawer>
      <Drawer.Trigger asChild>
        <Button>Abrir carrito</Button>
      </Drawer.Trigger>
      <Drawer.Content side={side} closeLabel="Cerrar">
        <Drawer.Header>
          <Drawer.Title>Carrito</Drawer.Title>
          <Drawer.Description>2 artículos listos.</Drawer.Description>
        </Drawer.Header>
        <Drawer.Body>
          <p>Contenido</p>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button color="primary">Pagar</Button>
          </Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>,
  );
}

describe("Drawer", () => {
  beforeEach(() => reduceMotion());

  it("opens from its trigger as a modal dialog and closes from inside", () => {
    renderDrawer();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Abrir carrito" }));
    const panel = screen.getByRole("dialog", { name: "Carrito" });
    expect(panel).toHaveAttribute("aria-modal", "true");
    expect(panel).toHaveAttribute("data-vx-side", "right");
    expect(panel).toHaveAccessibleDescription("2 artículos listos.");

    fireEvent.click(screen.getByRole("button", { name: "Pagar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("the built-in X and Escape both dismiss", () => {
    renderDrawer("left");
    fireEvent.click(screen.getByRole("button", { name: "Abrir carrito" }));
    expect(screen.getByRole("dialog")).toHaveAttribute("data-vx-side", "left");

    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Abrir carrito" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("exposes size as a data attribute", () => {
    render(
      <Drawer defaultOpen>
        <Drawer.Content size="lg">
          <Drawer.Title>Filtros</Drawer.Title>
        </Drawer.Content>
      </Drawer>,
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("data-vx-size", "lg");
  });

  it("has no accessibility violations while open", async () => {
    renderDrawer();
    fireEvent.click(screen.getByRole("button", { name: "Abrir carrito" }));
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results.violations).toHaveLength(0);
  });
});
