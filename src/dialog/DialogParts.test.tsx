import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Dialog } from "./index";
import { Menu } from "../menu";

afterEach(() => vi.unstubAllGlobals());

function reduceMotion() {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
}

describe("Dialog parts and sizes", () => {
  it("names and describes the dialog from Title/Description; X is the one closer", () => {
    reduceMotion();
    render(
      <Dialog defaultOpen>
        <Dialog.Trigger>Abrir</Dialog.Trigger>
        <Dialog.Content size="lg">
          <Dialog.Title className="custom">Editar perfil</Dialog.Title>
          <Dialog.Description>Actualiza tu nombre.</Dialog.Description>
          <input aria-label="Nombre" />
        </Dialog.Content>
      </Dialog>,
    );

    const dialog = screen.getByRole("dialog", { name: "Editar perfil" });
    expect(dialog).toHaveAccessibleDescription("Actualiza tu nombre.");
    expect(dialog).toHaveAttribute("data-vx-size", "lg");
    expect(screen.getByRole("heading", { name: "Editar perfil" })).toHaveClass(
      "vx-dialog__title",
      "custom",
    );

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("warns in dev when the dialog has no accessible name", () => {
    reduceMotion();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Dialog defaultOpen>
        <Dialog.Content>sin nombre</Dialog.Content>
      </Dialog>,
    );

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("accessible name"));
    warn.mockRestore();
  });

  it("renders detached (no trigger) as a centered dialog without a morph", () => {
    reduceMotion();
    render(
      <Dialog open>
        <Dialog.Content aria-label="Confirmar">¿Seguro?</Dialog.Content>
      </Dialog>,
    );

    const dialog = screen.getByRole("dialog", { name: "Confirmar" });
    expect(dialog).toHaveAttribute("data-vx-detached");
    expect(dialog).toHaveAttribute("data-vx-phase", "open");
  });

  it("announces alert dialogs and stacks nested dialogs (Esc peels one layer)", () => {
    reduceMotion();
    render(
      <Dialog defaultOpen>
        <Dialog.Content aria-label="Nota">
          <Dialog>
            <Dialog.Trigger>Eliminar</Dialog.Trigger>
            <Dialog.Content alert dismissable={false} aria-label="¿Eliminar nota?">
              <Dialog.Close>No</Dialog.Close>
            </Dialog.Content>
          </Dialog>
        </Dialog.Content>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    const confirm = screen.getByRole("alertdialog", { name: "¿Eliminar nota?" });
    expect(confirm).toBeInTheDocument();

    // Esc must NOT reach the outer dialog while the alert is on top (and the
    // alert itself is non-dismissable).
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    // The outer dialog survives beneath (inert while the alert is on top).
    const outer = () => document.querySelector('[data-vx-dialog][aria-label="Nota"]');
    expect(outer()).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "No" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(outer()).not.toBeInTheDocument();
  });

  it("composes Header/Icon/Body/Footer with pinned-chrome layout classes", () => {
    reduceMotion();
    render(
      <Dialog defaultOpen>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Icon tone="danger">
              <svg viewBox="0 0 16 16" />
            </Dialog.Icon>
            <Dialog.Title>¿Eliminar nota?</Dialog.Title>
            <Dialog.Description>No se puede deshacer.</Dialog.Description>
          </Dialog.Header>
          <Dialog.Body>contenido largo</Dialog.Body>
          <Dialog.Footer>
            <Dialog.Close>Eliminar</Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>,
    );

    const dialog = screen.getByRole("dialog", { name: "¿Eliminar nota?" });
    expect(dialog.querySelector(".vx-dialog__header")).toBeInTheDocument();
    expect(dialog.querySelector(".vx-dialog__body")).toHaveTextContent("contenido largo");
    const icon = dialog.querySelector(".vx-dialog__icon");
    expect(icon).toHaveAttribute("data-vx-tone", "danger");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps a Menu opened inside the Dialog interactive (not inert)", () => {
    reduceMotion();
    const onSelect = vi.fn();
    render(
      <Dialog defaultOpen>
        <Dialog.Trigger>Abrir</Dialog.Trigger>
        <Dialog.Content aria-label="Con menu">
          <Menu>
            <Menu.Trigger>Opciones</Menu.Trigger>
            <Menu.Content>
              <Menu.Item onSelect={onSelect}>Duplicar</Menu.Item>
            </Menu.Content>
          </Menu>
        </Dialog.Content>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Opciones" }));
    const item = screen.getByRole("menuitem", { name: "Duplicar" });
    expect(item.closest("[inert]")).toBeNull();

    fireEvent.click(item);
    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
