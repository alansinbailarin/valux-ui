import { describe, expect, it } from "vitest";

import { applyPortalTheme } from "./usePortalTheme";

function build(html: string): { trigger: HTMLElement; portal: HTMLElement } {
  document.body.innerHTML = html;
  const trigger = document.querySelector<HTMLElement>("#trigger");
  if (!trigger) throw new Error("fixture needs #trigger");
  const portal = document.createElement("div");
  return { trigger, portal };
}

describe("applyPortalTheme", () => {
  it("copies the nearest provider's theme attributes", () => {
    const { trigger, portal } = build(
      `<div data-vx-provider data-vx-mode="dark"><button id="trigger"></button></div>`,
    );
    applyPortalTheme(portal, trigger);
    expect(portal.getAttribute("data-vx-provider")).toBe("");
    expect(portal.getAttribute("data-vx-mode")).toBe("dark");
  });

  it("inherits the mode from an OUTER carrier when the nearest provider has none", () => {
    // A nested provider that only overrides colors must not strip the page's
    // mode from portaled panels (white-menus-in-dark regression).
    const { trigger, portal } = build(
      `<div data-vx-provider data-vx-mode="dark">
         <div data-vx-provider><button id="trigger"></button></div>
       </div>`,
    );
    applyPortalTheme(portal, trigger);
    expect(portal.getAttribute("data-vx-mode")).toBe("dark");
  });

  it("lets an inner mode override an outer one", () => {
    const { trigger, portal } = build(
      `<div data-vx-provider data-vx-mode="dark">
         <div data-vx-provider data-vx-mode="light"><button id="trigger"></button></div>
       </div>`,
    );
    applyPortalTheme(portal, trigger);
    expect(portal.getAttribute("data-vx-mode")).toBe("light");
  });

  it("clears a stale attribute when no ancestor carries it anymore", () => {
    const { trigger, portal } = build(
      `<div data-vx-provider><button id="trigger"></button></div>`,
    );
    portal.setAttribute("data-vx-mode", "dark");
    applyPortalTheme(portal, trigger);
    expect(portal.hasAttribute("data-vx-mode")).toBe(false);
  });
});
