import { describe, expect, it } from "vitest";

import { populateGhost } from "./populateGhost";

function makeTrigger(innerHTML: string): HTMLElement {
  const trigger = document.createElement("button");
  trigger.innerHTML = `<span class="vx-menu-trigger__content">${innerHTML}</span>`;
  document.body.appendChild(trigger);
  return trigger;
}

describe("populateGhost", () => {
  it("clones the FULL trigger content — text and icons travel together", () => {
    const ghost = document.createElement("span");
    const trigger = makeTrigger(
      'Nueva<span class="vx-button__icon"><svg /></span>',
    );

    populateGhost(ghost, trigger);

    expect(ghost.textContent).toContain("Nueva");
    expect(ghost.querySelector("svg")).not.toBeNull();
    trigger.remove();
  });

  it("copies the trigger's computed text color onto the ghost", () => {
    const ghost = document.createElement("span");
    const trigger = makeTrigger("Nueva");
    trigger.style.color = "rgb(255, 255, 255)";

    populateGhost(ghost, trigger);

    expect(ghost.style.color).toBe("rgb(255, 255, 255)");
    trigger.remove();
  });
});
