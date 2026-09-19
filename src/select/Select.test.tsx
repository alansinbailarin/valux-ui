import { act, fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Select } from "./index";
import type { SelectOption } from "./index";

const OPTIONS: SelectOption[] = [
  { value: "mx", label: "México" },
  { value: "us", label: "Estados Unidos", description: "USD" },
  { value: "br", label: "Brasil", disabled: true },
];

function reduceMotion() {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
}

function renderSelect(extra?: Partial<Parameters<typeof Select>[0]>) {
  return render(
    <Select options={OPTIONS} {...extra}>
      <Select.Trigger label="País" placeholder="Elige un país" />
      <Select.Content />
    </Select>,
  );
}

describe("Select", () => {
  beforeEach(() => reduceMotion());

  it("opens a listbox from the field and selects an option", () => {
    const onValueChange = vi.fn();
    renderSelect({ onValueChange });
    const trigger = screen.getByRole("combobox", { name: "País" });
    expect(trigger).toHaveTextContent("Elige un país");

    fireEvent.click(trigger);
    const listbox = screen.getByRole("listbox");
    expect(listbox).toBeInTheDocument();

    fireEvent.click(screen.getByRole("option", { name: "México" }));
    expect(onValueChange).toHaveBeenCalledWith("mx");
    expect(trigger).toHaveTextContent("México");
  });

  it("marks the selected option and disables options", () => {
    renderSelect({ defaultValue: "us" });
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("option", { name: /Estados Unidos/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("option", { name: "Brasil" })).toBeDisabled();
  });

  it("submits the selected value through the hidden input", () => {
    let data: FormData | null = null;
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          data = new FormData(event.currentTarget);
        }}
      >
        <Select options={OPTIONS} name="pais" defaultValue="mx">
          <Select.Trigger label="País" />
          <Select.Content />
        </Select>
        <button type="submit">Enviar</button>
      </form>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
    expect(data!.get("pais")).toBe("mx");
  });

  it("combobox mode filters options and shows empty state", () => {
    render(
      <Select options={OPTIONS}>
        <Select.Trigger label="País" />
        <Select.Content searchable searchPlaceholder="Buscar país" emptyMessage="Sin resultados" />
      </Select>,
    );
    fireEvent.click(screen.getByRole("combobox"));
    const search = screen.getByLabelText("Buscar país");
    fireEvent.change(search, { target: { value: "méx" } });
    expect(screen.getByRole("option", { name: "México" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Brasil" })).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: "zzz" } });
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
  });

  it("keyboard: arrows move between enabled options", () => {
    renderSelect({ defaultValue: "mx" });
    fireEvent.click(screen.getByRole("combobox"));
    const first = screen.getByRole("option", { name: "México" });
    act(() => first.focus());
    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(screen.getByRole("option", { name: /Estados Unidos/ })).toHaveFocus();
  });

  it("has no accessibility violations while open", async () => {
    const { baseElement } = renderSelect({ defaultValue: "mx" });
    fireEvent.click(screen.getByRole("combobox"));
    const results = await axe(baseElement, { rules: { region: { enabled: false } } });
    expect(results.violations).toHaveLength(0);
  });
});
