# Menu Morph — Milestone 1 (Morph Foundation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the shared, zero-dependency morph foundation the `Menu` (and future morphing components) build on: recover the tested spring sampler, reduced-motion helper, `useDismiss`, and `usePortalNode` from the discarded dialog work, and build a new **size-based** morph (`buildSizeKeyframes` + `runSizeMorph` + `useMorph`) that animates a panel's width/height/position — keeping text crisp — instead of transform-scale FLIP.

**Architecture:** `src/morph/` holds `spring.ts` + `reducedMotion.ts` (recovered) and the new size-morph (`buildSizeKeyframes.ts`, `runSizeMorph.ts`, `useMorph.ts`). `src/a11y/` holds `useDismiss.ts` + `usePortalNode.ts` (recovered). Nothing is wired to a component yet — this milestone is the tested engine only. The `Menu` component itself is M2 (separate plan).

**Tech Stack:** React 19, TypeScript, Web Animations API, Vitest + React Testing Library.

**Spec:** `docs/superpowers/specs/2026-07-17-menu-morph-design.md` (Milestone M1 only).

**Recovery source:** The discarded dialog branch tip is git commit `ad55987`. Its files are still in the object database and are extracted with `git show ad55987:<path>`.

**Conventions (from `CONTRIBUTING.md`):** organize by domain, public types in `*.types.ts`, production files ≤120 effective lines, TDD (RED → GREEN → refactor). Run one test file with `npx vitest run <path>`.

---

## File structure (created in M1)

```
src/morph/
  spring.ts            reducedMotion.ts          # recovered as-is (with tests)
  buildSizeKeyframes.ts  runSizeMorph.ts  useMorph.ts   # new, size-based
src/a11y/
  useDismiss.ts        usePortalNode.ts          # recovered
```

---

## Task 1: Recover the spring sampler

**Files:**
- Create: `src/morph/spring.ts`, `src/morph/spring.test.ts`

- [ ] **Step 1: Recover the module and its test from `ad55987`**

Run:
```bash
mkdir -p src/morph
git show ad55987:src/dialog/morph/spring.ts > src/morph/spring.ts
git show ad55987:src/dialog/morph/spring.test.ts > src/morph/spring.test.ts
```

- [ ] **Step 2: Run the recovered test to verify it passes in place**

Run: `npx vitest run src/morph/spring.test.ts`
Expected: PASS (3 tests). The module and test are self-contained (test imports `./spring`).

- [ ] **Step 3: Commit**

```bash
git add src/morph/spring.ts src/morph/spring.test.ts
git commit -m "feat(morph): recover spring sampler into shared module"
```

---

## Task 2: Recover the reduced-motion helper

**Files:**
- Create: `src/morph/reducedMotion.ts`, `src/morph/reducedMotion.test.ts`

- [ ] **Step 1: Recover from `ad55987`**

Run:
```bash
git show ad55987:src/dialog/morph/reducedMotion.ts > src/morph/reducedMotion.ts
git show ad55987:src/dialog/morph/reducedMotion.test.ts > src/morph/reducedMotion.test.ts
```

- [ ] **Step 2: Run the recovered test**

Run: `npx vitest run src/morph/reducedMotion.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 3: Commit**

```bash
git add src/morph/reducedMotion.ts src/morph/reducedMotion.test.ts
git commit -m "feat(morph): recover prefers-reduced-motion helper"
```

---

## Task 3: Size keyframes (`buildSizeKeyframes.ts`)

**Files:**
- Create: `src/morph/buildSizeKeyframes.ts`, `src/morph/buildSizeKeyframes.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/morph/buildSizeKeyframes.test.ts
import { describe, expect, it } from "vitest";

import { buildSizeKeyframes } from "./buildSizeKeyframes";

const trigger = { top: 300, left: 260, width: 52, height: 52 };
const panel = { top: 100, left: 120, width: 200, height: 180 };

describe("buildSizeKeyframes", () => {
  it("starts at the first rect and ends at the last rect", () => {
    const frames = buildSizeKeyframes(trigger, panel, [0, 0.5, 1]);

    expect(frames[0]).toEqual({
      offset: 0,
      left: "260px",
      top: "300px",
      width: "52px",
      height: "52px",
    });
    expect(frames[2]).toEqual({
      offset: 1,
      left: "120px",
      top: "100px",
      width: "200px",
      height: "180px",
    });
  });

  it("spreads offsets evenly and interpolates the midpoint size", () => {
    const frames = buildSizeKeyframes(trigger, panel, [0, 0.5, 1]);

    expect(frames[1].offset).toBe(0.5);
    expect(frames[1].width).toBe("126px");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/morph/buildSizeKeyframes.test.ts`
Expected: FAIL — `Cannot find module './buildSizeKeyframes'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/morph/buildSizeKeyframes.ts
export interface MorphRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function buildSizeKeyframes(
  first: MorphRect,
  last: MorphRect,
  progress: number[],
): Keyframe[] {
  const lastIndex = progress.length - 1;

  return progress.map((value, index) => ({
    offset: index / lastIndex,
    left: `${round(first.left + (last.left - first.left) * value)}px`,
    top: `${round(first.top + (last.top - first.top) * value)}px`,
    width: `${round(first.width + (last.width - first.width) * value)}px`,
    height: `${round(first.height + (last.height - first.height) * value)}px`,
  }));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/morph/buildSizeKeyframes.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/morph/buildSizeKeyframes.ts src/morph/buildSizeKeyframes.test.ts
git commit -m "feat(morph): interpolate size/position keyframes (crisp, no scale)"
```

---

## Task 4: Size morph runner (`runSizeMorph.ts`)

**Files:**
- Create: `src/morph/runSizeMorph.ts`, `src/morph/runSizeMorph.test.ts`

Uses the same `HTMLElement.prototype.animate` + `getBoundingClientRect` mocking pattern as `src/button/Button.motion.test.tsx`.

- [ ] **Step 1: Write the failing test**

```ts
// src/morph/runSizeMorph.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";

import { runSizeMorph } from "./runSizeMorph";

function element(rect: {
  top: number;
  left: number;
  width: number;
  height: number;
}) {
  const el = document.createElement("div");
  el.getBoundingClientRect = vi.fn(
    () =>
      ({
        ...rect,
        right: rect.left + rect.width,
        bottom: rect.top + rect.height,
        x: rect.left,
        y: rect.top,
        toJSON() {},
      }) as DOMRect,
  );
  return el;
}

function mockAnimate() {
  const animate = vi.fn(() => {
    const animation = { cancel: vi.fn(), onfinish: null as null | (() => void) };
    queueMicrotask(() => animation.onfinish?.());
    return animation as unknown as Animation;
  });
  Object.defineProperty(HTMLElement.prototype, "animate", {
    configurable: true,
    value: animate,
  });
  return { animate };
}

afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, "animate");
  vi.unstubAllGlobals();
});

describe("runSizeMorph", () => {
  it("animates the panel from the trigger rect to the panel rect on open", async () => {
    const { animate } = mockAnimate();
    const trigger = element({ top: 300, left: 260, width: 52, height: 52 });
    const panel = element({ top: 100, left: 120, width: 200, height: 180 });
    const onFinish = vi.fn();

    runSizeMorph({ panel, trigger, direction: "open", onFinish });
    await Promise.resolve();

    const [frames] = animate.mock.calls[0] as unknown as [Keyframe[]];
    expect(frames[0]).toMatchObject({ width: "52px", height: "52px" });
    expect(frames[frames.length - 1]).toMatchObject({
      width: "200px",
      height: "180px",
    });
    expect(onFinish).toHaveBeenCalledOnce();
  });

  it("skips animation and finishes immediately under reduced motion", () => {
    const { animate } = mockAnimate();
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
    const trigger = element({ top: 0, left: 0, width: 52, height: 52 });
    const panel = element({ top: 0, left: 0, width: 200, height: 180 });
    const onFinish = vi.fn();

    runSizeMorph({ panel, trigger, direction: "open", onFinish });

    expect(animate).not.toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/morph/runSizeMorph.test.ts`
Expected: FAIL — `Cannot find module './runSizeMorph'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/morph/runSizeMorph.ts
import { buildSizeKeyframes } from "./buildSizeKeyframes";
import type { MorphRect } from "./buildSizeKeyframes";
import { prefersReducedMotion } from "./reducedMotion";
import { sampleSpring } from "./spring";

const DURATION = 460;

export interface RunSizeMorphOptions {
  panel: HTMLElement;
  trigger: HTMLElement | null;
  direction: "open" | "close";
  onFinish: () => void;
}

function toRect(element: HTMLElement): MorphRect {
  const { top, left, width, height } = element.getBoundingClientRect();
  return { top, left, width, height };
}

export function runSizeMorph({
  panel,
  trigger,
  direction,
  onFinish,
}: RunSizeMorphOptions): void {
  if (
    prefersReducedMotion() ||
    typeof panel.animate !== "function" ||
    !trigger
  ) {
    onFinish();
    return;
  }

  const triggerRect = toRect(trigger);
  const panelRect = toRect(panel);
  const [from, to] =
    direction === "open" ? [triggerRect, panelRect] : [panelRect, triggerRect];
  const frames = buildSizeKeyframes(from, to, sampleSpring());

  const animation = panel.animate(frames, {
    duration: DURATION,
    easing: "linear",
    fill: "forwards",
  });
  animation.onfinish = () => onFinish();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/morph/runSizeMorph.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/morph/runSizeMorph.ts src/morph/runSizeMorph.test.ts
git commit -m "feat(morph): run size morph with spring + reduced-motion"
```

---

## Task 5: Morph hook (`useMorph.ts`)

**Files:**
- Create: `src/morph/useMorph.ts`, `src/morph/useMorph.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/morph/useMorph.test.tsx
import { useRef } from "react";
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useMorph } from "./useMorph";

afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, "animate");
  vi.unstubAllGlobals();
});

function Host({
  phase,
  onOpened,
}: {
  phase: "opening" | "open";
  onOpened: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(
    document.createElement("button"),
  );
  useMorph({ phase, panelRef, triggerRef, onOpened, onClosed: () => {} });
  return <div ref={panelRef} />;
}

describe("useMorph", () => {
  it("runs the open morph and calls onOpened under reduced motion", () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
    const onOpened = vi.fn();

    render(<Host phase="opening" onOpened={onOpened} />);

    expect(onOpened).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/morph/useMorph.test.tsx`
Expected: FAIL — `Cannot find module './useMorph'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/morph/useMorph.ts
import { useLayoutEffect } from "react";
import type { RefObject } from "react";

import { runSizeMorph } from "./runSizeMorph";

export type MorphPhase = "closed" | "opening" | "open" | "closing";

export interface UseMorphOptions {
  phase: MorphPhase;
  panelRef: RefObject<HTMLElement | null>;
  triggerRef: RefObject<HTMLElement | null>;
  onOpened: () => void;
  onClosed: () => void;
}

export function useMorph({
  phase,
  panelRef,
  triggerRef,
  onOpened,
  onClosed,
}: UseMorphOptions): void {
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (phase === "opening") {
      runSizeMorph({
        panel,
        trigger: triggerRef.current,
        direction: "open",
        onFinish: onOpened,
      });
    } else if (phase === "closing") {
      runSizeMorph({
        panel,
        trigger: triggerRef.current,
        direction: "close",
        onFinish: onClosed,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/morph/useMorph.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/morph/useMorph.ts src/morph/useMorph.test.tsx
git commit -m "feat(morph): drive size morph on phase change via hook"
```

---

## Task 6: Recover the dismiss hook

**Files:**
- Create: `src/a11y/useDismiss.ts`, `src/a11y/useDismiss.test.tsx`

- [ ] **Step 1: Recover from `ad55987`**

Run:
```bash
mkdir -p src/a11y
git show ad55987:src/dialog/a11y/useDismiss.ts > src/a11y/useDismiss.ts
git show ad55987:src/dialog/a11y/useDismiss.test.tsx > src/a11y/useDismiss.test.tsx
```

- [ ] **Step 2: Run the recovered test**

Run: `npx vitest run src/a11y/useDismiss.test.tsx`
Expected: PASS (2 tests). The hook depends only on React (`useEffect`, `RefObject`) and the test imports `./useDismiss`.

- [ ] **Step 3: Commit**

```bash
git add src/a11y/useDismiss.ts src/a11y/useDismiss.test.tsx
git commit -m "feat(a11y): recover Esc + outside-click dismiss hook"
```

---

## Task 7: Recover the portal-node hook (generic attribute + test)

**Files:**
- Create: `src/a11y/usePortalNode.ts`, `src/a11y/usePortalNode.test.tsx`

- [ ] **Step 1: Recover the module from `ad55987`**

Run:
```bash
git show ad55987:src/dialog/usePortalNode.ts > src/a11y/usePortalNode.ts
```

- [ ] **Step 2: Rename its marker attribute to a generic one**

Edit `src/a11y/usePortalNode.ts`: change the line
`element.setAttribute("data-dk-dialog-portal", "");`
to
`element.setAttribute("data-dk-portal", "");`

(Leave the rest, including the existing `// eslint-disable-next-line react-hooks/set-state-in-effect` comment, unchanged.)

- [ ] **Step 3: Write the failing test**

```tsx
// src/a11y/usePortalNode.test.tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { usePortalNode } from "./usePortalNode";

function Host({ active }: { active: boolean }) {
  const node = usePortalNode(active);
  return <span data-testid="state">{node ? "ready" : "none"}</span>;
}

describe("usePortalNode", () => {
  it("appends a marked body node while active and removes it on cleanup", () => {
    const { getByTestId, rerender, unmount } = render(<Host active />);

    expect(getByTestId("state")).toHaveTextContent("ready");
    expect(document.querySelector("[data-dk-portal]")).toBeInTheDocument();

    rerender(<Host active={false} />);
    expect(document.querySelector("[data-dk-portal]")).not.toBeInTheDocument();

    unmount();
  });
});
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/a11y/usePortalNode.test.tsx`
Expected: PASS. (The recovered hook creates a `data-dk-portal` div on `document.body` while active and removes it on cleanup.)

- [ ] **Step 5: Commit**

```bash
git add src/a11y/usePortalNode.ts src/a11y/usePortalNode.test.tsx
git commit -m "feat(a11y): recover portal-node hook with generic marker"
```

---

## Task 8: Foundation gate (suite + lint + typecheck)

**Files:** none (verification only).

- [ ] **Step 1: Run the whole unit suite**

Run: `npx vitest run`
Expected: PASS — all prior suites plus the new `src/morph/**` and `src/a11y/**` tests (spring, reducedMotion, buildSizeKeyframes, runSizeMorph, useMorph, useDismiss, usePortalNode).

- [ ] **Step 2: Lint + typecheck**

Run: `npx eslint . && npx tsc --noEmit`
Expected: no errors. If any new file exceeds 120 effective lines, split it and re-run (none should — each is small).

- [ ] **Step 3: Commit (if anything was adjusted in Step 2)**

```bash
git add -A
git commit -m "chore(morph): green foundation gate for Menu M1"
```

---

## Self-review (completed by plan author)

**Spec coverage (M1 slice):**
- Recover spring + reducedMotion → Tasks 1, 2.
- New size-morph (crisp, no scale): `buildSizeKeyframes` (Task 3), `runSizeMorph` (Task 4), `useMorph` (Task 5).
- Recover `useDismiss` (Task 6) and `usePortalNode` (Task 7).
- Suite/lint/typecheck gate → Task 8.
- **Deferred (M2/M3, separate plans):** the `Menu` compound (root/trigger/content/item), placement, keyboard, tokens/CSS, browser demo.

**Placeholder scan:** none — recovered files come via exact `git show` commands; new modules have full source in their steps.

**Type consistency:** `MorphRect` is defined in `buildSizeKeyframes.ts` (Task 3) and imported by `runSizeMorph.ts` (Task 4). `RunSizeMorphOptions` (Task 4) matches the `runSizeMorph` call in `useMorph.ts` (Task 5). `MorphPhase` and `UseMorphOptions` are defined in `useMorph.ts` (Task 5) for M2 to consume.

**Open item:** `DURATION = 460` and the spring defaults are the first-pass "springy" feel; they are tuned in the browser during M2 and exposed via `--dk-motion-spring-*` tokens.
