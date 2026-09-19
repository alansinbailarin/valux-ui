import { createRef } from "react";
import type { CSSProperties } from "react";
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ValuxProvider } from "./index";
import type { ValuxTheme } from "./index";

describe("ValuxProvider", () => {
  it("maps a complete theme to scoped attributes and variables", () => {
    const ref = createRef<HTMLDivElement>();
    const theme: ValuxTheme = {
      mode: "dark",
      color: { primary: "#ef4444", surfaceTint: 50 },
      density: "sm",
      fontFamily: "var(--font-geist)",
    };

    render(
      <ValuxProvider
        ref={ref}
        data-testid="provider"
        className="consumer"
        theme={theme}
      >
        Content
      </ValuxProvider>,
    );

    const provider = screen.getByTestId("provider");
    expect(provider).toHaveAttribute("data-vx-provider", "");
    expect(provider).toHaveAttribute("data-vx-mode", "dark");
    expect(provider).toHaveAttribute("data-vx-density", "sm");
    expect(provider).toHaveClass("consumer");
    expect(provider).toHaveTextContent("Content");
    expect(provider.style.getPropertyValue("--vx-color-primary")).toBe(
      "#ef4444",
    );
    expect(
      provider.style.getPropertyValue("--vx-color-primary-solid"),
    ).not.toBe("#ef4444");
    expect(provider.style.getPropertyValue("--vx-color-on-primary")).toBe(
      "#ffffff",
    );
    expect(provider.style.getPropertyValue("--vx-surface-tint")).toBe("10%");
    expect(
      provider.style.getPropertyValue("--vx-surface-tint-raised"),
    ).toBe("6%");
    expect(provider.style.getPropertyValue("--vx-font-family")).toBe(
      "var(--font-geist)",
    );
    expect(ref.current).toBe(provider);
  });

  it("lets consumer style intentionally override generated variables", () => {
    render(
      <ValuxProvider
        data-testid="provider"
        theme={{ color: { primary: "#ef4444" } }}
        style={{ "--vx-color-primary": "#2563eb" } as CSSProperties}
      />,
    );

    expect(
      screen
        .getByTestId("provider")
        .style.getPropertyValue("--vx-color-primary"),
    ).toBe("#2563eb");
  });

  it("omits unspecified values so nested providers inherit", () => {
    render(
      <ValuxProvider theme={{ color: { primary: "#ef4444" } }}>
        <ValuxProvider data-testid="nested" theme={{ density: "lg" }} />
      </ValuxProvider>,
    );

    const nested = screen.getByTestId("nested");
    expect(nested.style.getPropertyValue("--vx-color-primary")).toBe("");
    expect(nested).not.toHaveAttribute("data-vx-mode");
    expect(nested).toHaveAttribute("data-vx-density", "lg");
  });

  it("accepts CSS variables when onPrimary is explicit", () => {
    render(
      <ValuxProvider
        data-testid="provider"
        theme={{
          color: {
            primary: "var(--brand)",
            onPrimary: "var(--brand-text)",
          },
        }}
      />,
    );

    expect(
      screen
        .getByTestId("provider")
        .style.getPropertyValue("--vx-color-on-primary"),
    ).toBe("var(--brand-text)");
    expect(
      screen
        .getByTestId("provider")
        .style.getPropertyValue("--vx-color-primary-solid"),
    ).toBe("var(--brand)");
  });

  it("rejects unsupported primary colors without onPrimary", () => {
    expect(() =>
      render(
        <ValuxProvider
          theme={{ color: { primary: "var(--brand)" } }}
        />,
      ),
    ).toThrow(/set color\.onPrimary/i);
  });

  it("renders on the server without browser APIs", () => {
    const html = renderToString(
      <ValuxProvider theme={{ mode: "system", density: "lg" }}>
        Server content
      </ValuxProvider>,
    );

    expect(html).toContain('data-vx-mode="system"');
    expect(html).toContain("Server content");
  });
});
