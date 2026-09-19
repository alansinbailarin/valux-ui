import { fireEvent, render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { ButtonShowroom } from "./ButtonShowroom";

describe("ButtonShowroom", () => {
  it("applies controls to the button preview", () => {
    render(<ButtonShowroom />);
    const preview = screen.getByTestId("button-preview");

    fireEvent.click(screen.getByRole("button", { name: "Link" }));
    fireEvent.click(
      within(screen.getByRole("group", { name: "Variante" })).getByRole(
        "button",
        { name: "Soft" },
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Danger" }));
    fireEvent.click(screen.getByRole("button", { name: "Loading" }));
    fireEvent.click(screen.getByRole("button", { name: "Both" }));
    fireEvent.click(
      within(screen.getByRole("group", { name: "Ancho" })).getByRole(
        "button",
        { name: "Full" },
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Grab" }));

    fireEvent.click(screen.getByRole("button", { name: "Dark" }));
    fireEvent.change(screen.getByLabelText("Color primario"), {
      target: { value: "#ef4444" },
    });
    fireEvent.change(screen.getByLabelText("Intensidad"), {
      target: { value: "50" },
    });
    fireEvent.click(
      within(screen.getByRole("group", { name: "Densidad" })).getByRole(
        "button",
        { name: "Lg" },
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Mono" }));

    expect(preview).toHaveAttribute("data-vx-mode", "dark");
    expect(preview).toHaveAttribute("data-vx-density", "lg");
    const action = screen.getByRole("link", { name: "Continue" });
    expect(action).toHaveAttribute("aria-disabled", "true");
    expect(action).toHaveAttribute("aria-busy", "true");
    expect(action).toHaveAttribute("data-vx-variant", "soft");
    expect(action).toHaveAttribute("data-vx-color", "danger");
    expect(action).toHaveAttribute("data-vx-full-width");
    expect(action).toHaveStyle({ cursor: "not-allowed" });
    expect(action.querySelectorAll(".vx-button__icon")).toHaveLength(2);
    expect(preview.style.getPropertyValue("--vx-color-primary")).toBe(
      "#ef4444",
    );
    expect(preview.style.getPropertyValue("--vx-surface-tint")).toBe("10%");
    expect(preview.style.getPropertyValue("--vx-font-family")).toBe(
      "var(--font-geist-mono)",
    );
  });

  it("previews an accessible icon-only Button", () => {
    render(<ButtonShowroom />);
    fireEvent.click(screen.getByRole("button", { name: "Icon only" }));

    expect(screen.getByRole("button", { name: "Continue" })).toHaveAttribute(
      "data-vx-icon-only",
    );
  });

  it("edits and clears optional loading text", () => {
    render(<ButtonShowroom />);
    fireEvent.click(screen.getByRole("button", { name: "Loading" }));

    const input = screen.getByLabelText("Texto loading");
    fireEvent.change(input, { target: { value: "Guardando..." } });

    expect(
      screen.getByRole("button", { name: "Guardando..." }),
    ).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "" } });

    const button = screen.getByRole("button", { name: "Continue" });
    expect(button.querySelector(".vx-button__loading-text")).toBeNull();
  });

  it("previews individually imported Heroicons", () => {
    render(<ButtonShowroom />);
    fireEvent.click(screen.getByRole("button", { name: "Both" }));

    const button = screen.getByRole("button", { name: "Continue" });
    expect(button.querySelectorAll('svg[data-slot="icon"]')).toHaveLength(2);
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<ButtonShowroom />);
    const results = await axe(container);

    expect(results.violations).toHaveLength(0);
  });
});
