# Menu Morph — Milestone 2 (Menu Core) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `Menu` compound component on top of the M1 morph foundation — a non-modal actions menu whose `+` trigger morphs (size-based, crisp) into a content-sized panel of items, closes on outside-click / Esc, focuses the first item on open and restores the trigger on close, and honors reduced-motion.

**Architecture:** Compound `Menu` + `Menu.Trigger` + `Menu.Content` + `Menu.Item`. Root owns open state (controlled/uncontrolled) and an animation phase; the content is portaled to `document.body` (via the recovered `usePortalNode`), positioned at the trigger (fixed placement for M2; collision/`side`/`align` is M3), and animated with the recovered `useMorph` (size-based). Dismiss uses the recovered `useDismiss`. Plain CSS `--dk-*` tokens; zero deps.

**Tech Stack:** React 19, TypeScript, plain CSS, Web Animations API (via M1 engine), Vitest + RTL + jest-axe.

**Spec:** `docs/superpowers/specs/2026-07-17-menu-morph-design.md` (Milestone M2). M1 foundation (`src/morph/`, `src/a11y/`) already exists on this branch.

**Conventions:** organize by domain, public types in `*.types.ts`, production files ≤120 effective lines, TDD (RED → GREEN → refactor). One test file: `npx vitest run <path>`.

**M2 scope note:** `Menu.Content` accepts `side`/`align` props (part of the public API) but M2 positions the panel at the trigger (fixed); collision-aware placement and full roving keyboard (arrow keys) are M3. M2 keyboard = native button activation (Enter/Space on items) + Esc close + focus first item on open + restore trigger on close.

---

## File structure (created in M2)

```
src/menu/
  useMenuState.ts  Menu.types.ts  MenuContext.ts
  Menu.tsx  MenuTrigger.tsx  MenuItem.tsx  MenuContent.tsx  MenuContentSurface.tsx
  index.ts
src/styles/  menu-tokens.css  menu-content.css  menu-item.css
```
`src/index.ts` re-exports `./menu`. `src/styles.css` imports the three menu CSS files.

---

## Task 1: Open-state hook (`useMenuState.ts`)

**Files:**
- Create: `src/menu/useMenuState.ts`, `src/menu/useMenuState.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/menu/useMenuState.test.ts
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useMenuState } from "./useMenuState";

describe("useMenuState", () => {
  it("manages uncontrolled state from defaultOpen", () => {
    const { result } = renderHook(() => useMenuState({ defaultOpen: false }));

    expect(result.current[0]).toBe(false);
    act(() => result.current[1](true));
    expect(result.current[0]).toBe(true);
  });

  it("stays controlled and only notifies via onOpenChange", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() =>
      useMenuState({ open: false, onOpenChange }),
    );

    act(() => result.current[1](true));

    expect(result.current[0]).toBe(false);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/menu/useMenuState.test.ts`
Expected: FAIL — `Cannot find module './useMenuState'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/menu/useMenuState.ts
import { useCallback, useState } from "react";

export interface MenuStateOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function useMenuState({
  open,
  defaultOpen = false,
  onOpenChange,
}: MenuStateOptions): readonly [boolean, (next: boolean) => void] {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolled;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  return [isOpen, setOpen] as const;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/menu/useMenuState.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/menu/useMenuState.ts src/menu/useMenuState.test.ts
git commit -m "feat(menu): controlled/uncontrolled open-state hook"
```

---

## Task 2: Types + context (`Menu.types.ts`, `MenuContext.ts`)

**Files:**
- Create: `src/menu/Menu.types.ts`, `src/menu/MenuContext.ts`, `src/menu/MenuContext.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/menu/MenuContext.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MenuContext, useMenuContext } from "./MenuContext";

function Consumer() {
  const { phase } = useMenuContext();
  return <span>{phase}</span>;
}

describe("useMenuContext", () => {
  it("throws when used outside a Menu", () => {
    expect(() => render(<Consumer />)).toThrow(/must be used within <Menu>/i);
  });

  it("exposes the provided value", () => {
    render(
      <MenuContext.Provider
        value={{
          open: true,
          phase: "open",
          setOpen: () => {},
          setPhase: () => {},
          triggerRef: { current: null },
          menuId: "m1",
        }}
      >
        <Consumer />
      </MenuContext.Provider>,
    );

    expect(screen.getByText("open")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/menu/MenuContext.test.tsx`
Expected: FAIL — `Cannot find module './MenuContext'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/menu/Menu.types.ts
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";

import type { MorphPhase } from "../morph/useMorph";

export type { MorphPhase };
export type MenuSide = "top" | "bottom" | "left" | "right" | "auto";
export type MenuAlign = "start" | "center" | "end" | "auto";

export interface MenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export type MenuTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

export interface MenuContentProps extends HTMLAttributes<HTMLDivElement> {
  side?: MenuSide;
  align?: MenuAlign;
}

export interface MenuItemProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  destructive?: boolean;
  onSelect?: () => void;
}
```

```ts
// src/menu/MenuContext.ts
import { createContext, useContext } from "react";
import type { MutableRefObject } from "react";

import type { MorphPhase } from "../morph/useMorph";

export interface MenuContextValue {
  open: boolean;
  phase: MorphPhase;
  setOpen: (open: boolean) => void;
  setPhase: (phase: MorphPhase) => void;
  triggerRef: MutableRefObject<HTMLElement | null>;
  menuId: string;
}

export const MenuContext = createContext<MenuContextValue | null>(null);

export function useMenuContext(): MenuContextValue {
  const context = useContext(MenuContext);

  if (!context) {
    throw new Error("Menu parts must be used within <Menu>.");
  }

  return context;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/menu/MenuContext.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/menu/Menu.types.ts src/menu/MenuContext.ts src/menu/MenuContext.test.tsx
git commit -m "feat(menu): public types and context"
```

---

## Task 3: Root (`Menu.tsx`)

**Files:**
- Create: `src/menu/Menu.tsx`, `src/menu/Menu.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/menu/Menu.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Menu } from "./Menu";
import { useMenuContext } from "./MenuContext";

function Probe() {
  const { phase, open } = useMenuContext();
  return <span data-testid="probe">{`${open}:${phase}`}</span>;
}

describe("Menu root", () => {
  it("starts closed", () => {
    render(
      <Menu>
        <Probe />
      </Menu>,
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("false:closed");
  });

  it("derives opening from a controlled open prop", () => {
    render(
      <Menu open>
        <Probe />
      </Menu>,
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("true:opening");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/menu/Menu.test.tsx`
Expected: FAIL — `Cannot find module './Menu'`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/menu/Menu.tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { MenuProps, MorphPhase } from "./Menu.types";
import { MenuContext } from "./MenuContext";
import { useMenuState } from "./useMenuState";

export function Menu({ open, defaultOpen, onOpenChange, children }: MenuProps) {
  const [isOpen, setOpen] = useMenuState({ open, defaultOpen, onOpenChange });
  const [phase, setPhase] = useState<MorphPhase>("closed");
  const triggerRef = useRef<HTMLElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    // Sync (possibly controlled) open into the animation phase.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase((current) => {
      if (isOpen && current === "closed") return "opening";
      if (!isOpen && (current === "open" || current === "opening")) {
        return "closing";
      }
      return current;
    });
  }, [isOpen]);

  return (
    <MenuContext.Provider
      value={{ open: isOpen, phase, setOpen, setPhase, triggerRef, menuId }}
    >
      {children}
    </MenuContext.Provider>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/menu/Menu.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/menu/Menu.tsx src/menu/Menu.test.tsx
git commit -m "feat(menu): root with open/phase orchestration"
```

---

## Task 4: Trigger (`MenuTrigger.tsx`)

**Files:**
- Create: `src/menu/MenuTrigger.tsx`, `src/menu/MenuTrigger.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/menu/MenuTrigger.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Menu } from "./Menu";
import { MenuTrigger } from "./MenuTrigger";

describe("MenuTrigger", () => {
  it("toggles the menu and exposes aria-haspopup/expanded", () => {
    render(
      <Menu>
        <MenuTrigger>+</MenuTrigger>
      </Menu>,
    );
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("marks itself hidden while the menu is open", () => {
    render(
      <Menu open>
        <MenuTrigger>+</MenuTrigger>
      </Menu>,
    );
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-dk-menu-origin",
      "hidden",
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/menu/MenuTrigger.test.tsx`
Expected: FAIL — `Cannot find module './MenuTrigger'`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/menu/MenuTrigger.tsx
"use client";

import { useCallback } from "react";
import type { MouseEvent } from "react";

import type { MenuTriggerProps } from "./Menu.types";
import { useMenuContext } from "./MenuContext";

export function MenuTrigger({
  children,
  className,
  onClick,
  ...props
}: MenuTriggerProps) {
  const { open, phase, setOpen, triggerRef, menuId } = useMenuContext();
  const hidden = phase !== "closed";

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) setOpen(!open);
    },
    [onClick, setOpen, open],
  );

  return (
    <button
      {...props}
      ref={(node) => {
        triggerRef.current = node;
      }}
      type="button"
      id={`${menuId}-trigger`}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={hidden ? menuId : undefined}
      data-dk-menu-origin={hidden ? "hidden" : undefined}
      className={["dk-menu-trigger", className].filter(Boolean).join(" ")}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/menu/MenuTrigger.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/menu/MenuTrigger.tsx src/menu/MenuTrigger.test.tsx
git commit -m "feat(menu): trigger that toggles and hides as morph origin"
```

---

## Task 5: Item (`MenuItem.tsx`)

**Files:**
- Create: `src/menu/MenuItem.tsx`, `src/menu/MenuItem.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/menu/MenuItem.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Menu } from "./Menu";
import { MenuContext } from "./MenuContext";
import { MenuItem } from "./MenuItem";

function withContext(ui: React.ReactNode, setOpen = () => {}) {
  return render(
    <MenuContext.Provider
      value={{
        open: true,
        phase: "open",
        setOpen,
        setPhase: () => {},
        triggerRef: { current: null },
        menuId: "m1",
      }}
    >
      {ui}
    </MenuContext.Provider>,
  );
}

describe("MenuItem", () => {
  it("fires onSelect and closes on click", () => {
    const onSelect = vi.fn();
    const setOpen = vi.fn();
    withContext(<MenuItem onSelect={onSelect}>Editar</MenuItem>, setOpen);

    fireEvent.click(screen.getByRole("menuitem", { name: "Editar" }));

    expect(onSelect).toHaveBeenCalledOnce();
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it("does nothing when disabled", () => {
    const onSelect = vi.fn();
    const setOpen = vi.fn();
    withContext(
      <MenuItem disabled onSelect={onSelect}>
        Compartir
      </MenuItem>,
      setOpen,
    );

    const item = screen.getByRole("menuitem", { name: "Compartir" });
    expect(item).toBeDisabled();
    fireEvent.click(item);
    expect(onSelect).not.toHaveBeenCalled();
    expect(setOpen).not.toHaveBeenCalled();
  });

  it("marks destructive items with a data attribute", () => {
    withContext(<MenuItem destructive>Eliminar</MenuItem>);
    expect(screen.getByRole("menuitem", { name: "Eliminar" })).toHaveAttribute(
      "data-dk-destructive",
      "",
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/menu/MenuItem.test.tsx`
Expected: FAIL — `Cannot find module './MenuItem'`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/menu/MenuItem.tsx
"use client";

import { useCallback } from "react";
import type { MouseEvent } from "react";

import type { MenuItemProps } from "./Menu.types";
import { useMenuContext } from "./MenuContext";

export function MenuItem({
  children,
  className,
  icon,
  destructive,
  disabled,
  onSelect,
  onClick,
  ...props
}: MenuItemProps) {
  const { setOpen } = useMenuContext();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || disabled) return;
      onSelect?.();
      setOpen(false);
    },
    [onClick, disabled, onSelect, setOpen],
  );

  return (
    <button
      {...props}
      type="button"
      role="menuitem"
      disabled={disabled}
      aria-disabled={disabled || undefined}
      data-dk-menu-item=""
      data-dk-destructive={destructive ? "" : undefined}
      className={["dk-menu-item", className].filter(Boolean).join(" ")}
      onClick={handleClick}
    >
      {icon ? (
        <span aria-hidden="true" className="dk-menu-item__icon">
          {icon}
        </span>
      ) : null}
      <span className="dk-menu-item__label">{children}</span>
    </button>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/menu/MenuItem.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/menu/MenuItem.tsx src/menu/MenuItem.test.tsx
git commit -m "feat(menu): item with onSelect, disabled, destructive"
```

---

## Task 6: Content (`MenuContent.tsx` + `MenuContentSurface.tsx`)

**Files:**
- Create: `src/menu/MenuContentSurface.tsx`, `src/menu/MenuContent.tsx`, `src/menu/MenuContent.test.tsx`

The gate (`MenuContent`) renders the surface into a portal only once the portal
node exists, so the surface mounts fresh and its morph effect fires. The surface
wires morph + dismiss + first-item focus and positions the panel at the trigger.

- [ ] **Step 1: Write the failing test**

```tsx
// src/menu/MenuContent.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Menu } from "./Menu";
import { MenuContent } from "./MenuContent";
import { MenuItem } from "./MenuItem";
import { MenuTrigger } from "./MenuTrigger";

afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, "animate");
  vi.unstubAllGlobals();
});

function reduceMotion() {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
}

describe("MenuContent", () => {
  it("is not rendered while closed", () => {
    render(
      <Menu>
        <MenuTrigger>+</MenuTrigger>
        <MenuContent>
          <MenuItem>Editar</MenuItem>
        </MenuContent>
      </Menu>,
    );
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens a labelled menu, focuses the first item, and closes on Escape", () => {
    reduceMotion();
    render(
      <Menu>
        <MenuTrigger>+</MenuTrigger>
        <MenuContent>
          <MenuItem>Editar</MenuItem>
          <MenuItem>Eliminar</MenuItem>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole("button"));
    const menu = screen.getByRole("menu");
    expect(menu).toHaveAttribute("aria-labelledby");
    expect(screen.getByRole("menuitem", { name: "Editar" })).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("has no accessibility violations while open", async () => {
    reduceMotion();
    const { baseElement } = render(
      <Menu open>
        <MenuTrigger aria-label="Acciones">+</MenuTrigger>
        <MenuContent>
          <MenuItem>Editar</MenuItem>
        </MenuContent>
      </Menu>,
    );
    expect((await axe(baseElement)).violations).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/menu/MenuContent.test.tsx`
Expected: FAIL — `Cannot find module './MenuContent'`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/menu/MenuContentSurface.tsx
"use client";

import { useLayoutEffect, useRef } from "react";

import type { MenuContentProps } from "./Menu.types";
import { useMenuContext } from "./MenuContext";
import { useDismiss } from "../a11y/useDismiss";
import { useMorph } from "../morph/useMorph";

interface MenuContentSurfaceProps extends MenuContentProps {
  portalNode: HTMLElement;
}

export function MenuContentSurface({
  children,
  side = "auto",
  align = "auto",
  className,
  style,
  ...props
}: MenuContentSurfaceProps) {
  const { phase, setOpen, setPhase, triggerRef, menuId } = useMenuContext();
  const panelRef = useRef<HTMLDivElement>(null);
  const active = phase === "opening" || phase === "open";
  const rect = triggerRef.current?.getBoundingClientRect();

  useMorph({
    phase,
    panelRef,
    triggerRef,
    onOpened: () => setPhase("open"),
    onClosed: () => setPhase("closed"),
  });
  useDismiss({
    active,
    dismissable: true,
    panelRef,
    onDismiss: () => setOpen(false),
  });

  useLayoutEffect(() => {
    if (phase === "open") {
      panelRef.current
        ?.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')
        ?.focus();
    }
  }, [phase]);

  useLayoutEffect(() => {
    return () => {
      triggerRef.current?.focus?.();
    };
  }, [triggerRef]);

  return (
    <div
      {...props}
      ref={panelRef}
      id={menuId}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby={`${menuId}-trigger`}
      data-dk-menu=""
      data-dk-phase={phase}
      data-dk-side={side}
      data-dk-align={align}
      className={["dk-menu", className].filter(Boolean).join(" ")}
      style={{
        position: "fixed",
        left: rect?.left ?? 0,
        top: rect?.top ?? 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
```

```tsx
// src/menu/MenuContent.tsx
"use client";

import { createPortal } from "react-dom";

import type { MenuContentProps } from "./Menu.types";
import { MenuContentSurface } from "./MenuContentSurface";
import { useMenuContext } from "./MenuContext";
import { usePortalNode } from "../a11y/usePortalNode";

export function MenuContent(props: MenuContentProps) {
  const { phase } = useMenuContext();
  const portalNode = usePortalNode(phase !== "closed");

  if (!portalNode) return null;

  return createPortal(<MenuContentSurface {...props} />, portalNode);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/menu/MenuContent.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/menu/MenuContentSurface.tsx src/menu/MenuContent.tsx src/menu/MenuContent.test.tsx
git commit -m "feat(menu): portaled morphing content with dismiss + first-item focus"
```

---

## Task 7: Barrel + root export (`index.ts`)

**Files:**
- Create: `src/menu/index.ts`, `src/menu/index.test.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/menu/index.test.ts
import { describe, expect, it } from "vitest";

import { Menu } from "./index";

describe("menu barrel", () => {
  it("exposes a compound Menu with all parts", () => {
    expect(typeof Menu).toBe("function");
    expect(typeof Menu.Trigger).toBe("function");
    expect(typeof Menu.Content).toBe("function");
    expect(typeof Menu.Item).toBe("function");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/menu/index.test.ts`
Expected: FAIL — `Cannot find module './index'` (or `Menu.Trigger` undefined).

- [ ] **Step 3: Write minimal implementation**

```ts
// src/menu/index.ts
import { Menu as MenuRoot } from "./Menu";
import { MenuContent } from "./MenuContent";
import { MenuItem } from "./MenuItem";
import { MenuTrigger } from "./MenuTrigger";

type MenuComponent = typeof MenuRoot & {
  Trigger: typeof MenuTrigger;
  Content: typeof MenuContent;
  Item: typeof MenuItem;
};

const Menu = MenuRoot as MenuComponent;
Menu.Trigger = MenuTrigger;
Menu.Content = MenuContent;
Menu.Item = MenuItem;

export { Menu };
export type {
  MenuAlign,
  MenuContentProps,
  MenuItemProps,
  MenuProps,
  MenuSide,
  MenuTriggerProps,
} from "./Menu.types";
```

Then add to `src/index.ts` (after the existing exports):

```ts
export * from "./button";
export * from "./theme";
export * from "./menu";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/menu/index.test.ts src/index.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/menu/index.ts src/menu/index.test.ts src/index.ts
git commit -m "feat(menu): export compound Menu from package root"
```

---

## Task 8: Styles — tokens, content, item

**Files:**
- Create: `src/styles/menu-tokens.css`, `src/styles/menu-content.css`, `src/styles/menu-item.css`
- Modify: `src/styles.css`, `src/styles.test.ts`, `src/structure.test.ts`

- [ ] **Step 1: Write the failing test**

Add to the ordered import list in `src/styles.test.ts` (inside the `.toBe([...])` array, after `'@import "./styles/button-sizes.css";'`):

```ts
        '@import "./styles/button-sizes.css";',
        '@import "./styles/menu-tokens.css";',
        '@import "./styles/menu-content.css";',
        '@import "./styles/menu-item.css";',
```

Add a new test at the end of the `describe("public stylesheet", …)` block in `src/styles.test.ts`:

```ts
  it("defines a content-sized morphing menu surface and item stagger", async () => {
    const [tokens, content, item] = await Promise.all([
      readFile(resolve("src/styles/menu-tokens.css"), "utf8"),
      readFile(resolve("src/styles/menu-content.css"), "utf8"),
      readFile(resolve("src/styles/menu-item.css"), "utf8"),
    ]);

    expect(tokens).toContain("--dk-menu-surface:");
    expect(tokens).toContain("--dk-menu-z:");
    expect(content).toMatch(/\[data-dk-menu\]\s*\{[^}]*width:\s*max-content;/);
    expect(content).toContain("transform-origin: top left;");
    expect(item).toContain("[data-dk-menu-item]");
    expect(item).toContain('[data-dk-menu-item][data-dk-destructive]');
  });
```

Add the three files to `requiredFiles` in `src/structure.test.ts` (after `"src/styles/button-sizes.css"`):

```ts
  "src/styles/button-sizes.css",
  "src/styles/menu-tokens.css",
  "src/styles/menu-content.css",
  "src/styles/menu-item.css",
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/styles.test.ts src/structure.test.ts`
Expected: FAIL — import-order mismatch + missing files.

- [ ] **Step 3: Write minimal implementation**

```css
/* src/styles/menu-tokens.css */
:root {
  --dk-menu-z: 1000;
  --dk-menu-surface: var(--dk-color-surface-raised);
  --dk-menu-radius: 1rem;
  --dk-menu-shadow:
    0 22px 55px color-mix(in srgb, var(--dk-color-on-surface), transparent 76%),
    0 4px 12px color-mix(in srgb, var(--dk-color-on-surface), transparent 86%);
  --dk-menu-padding: 0.375rem;
  --dk-menu-item-padding: 0.6875rem 1.125rem;
  --dk-menu-item-gap: 0.75rem;
  --dk-menu-item-radius: 0.75rem;
  --dk-menu-item-hover: color-mix(
    in srgb,
    var(--dk-color-on-surface),
    transparent 92%
  );
}
```

```css
/* src/styles/menu-content.css */
[data-dk-menu] {
  z-index: var(--dk-menu-z);
  width: max-content;
  padding: var(--dk-menu-padding);
  overflow: hidden;
  transform-origin: top left;
  border: 1px solid
    color-mix(in srgb, var(--dk-color-on-surface), transparent 90%);
  border-radius: var(--dk-menu-radius);
  background: var(--dk-menu-surface);
  color: var(--dk-color-on-surface);
  box-shadow: var(--dk-menu-shadow);
  font-family: var(--dk-font-family);
}

.dk-menu-trigger[data-dk-menu-origin="hidden"] {
  opacity: 0;
  pointer-events: none;
}
```

```css
/* src/styles/menu-item.css */
[data-dk-menu-item] {
  display: flex;
  width: 100%;
  align-items: center;
  gap: var(--dk-menu-item-gap);
  border: none;
  border-radius: var(--dk-menu-item-radius);
  padding: var(--dk-menu-item-padding);
  background: transparent;
  color: inherit;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
  font-size: var(--dk-font-size-control);
  font-weight: 530;
  opacity: 0;
  transform: translate(-6px, 6px);
  transition:
    opacity 0.3s ease,
    transform 0.5s cubic-bezier(0.22, 1.5, 0.36, 1);
}

[data-dk-menu][data-dk-phase="open"] [data-dk-menu-item],
[data-dk-menu][data-dk-phase="opening"] [data-dk-menu-item] {
  opacity: 1;
  transform: none;
}

[data-dk-menu-item]:hover:not(:disabled) {
  background: var(--dk-menu-item-hover);
}

[data-dk-menu-item]:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

[data-dk-menu-item][data-dk-destructive] {
  color: var(--dk-color-danger-foreground);
}

[data-dk-menu][data-dk-phase="opening"] [data-dk-menu-item]:nth-child(1) {
  transition-delay: 0.12s;
}
[data-dk-menu][data-dk-phase="opening"] [data-dk-menu-item]:nth-child(2) {
  transition-delay: 0.17s;
}
[data-dk-menu][data-dk-phase="opening"] [data-dk-menu-item]:nth-child(3) {
  transition-delay: 0.22s;
}
[data-dk-menu][data-dk-phase="opening"] [data-dk-menu-item]:nth-child(4) {
  transition-delay: 0.27s;
}
[data-dk-menu][data-dk-phase="opening"] [data-dk-menu-item]:nth-child(n + 5) {
  transition-delay: 0.32s;
}

.dk-menu-item__icon {
  display: inline-flex;
  flex: none;
  width: 1.25em;
  height: 1.25em;
  align-items: center;
  justify-content: center;
}

.dk-menu-item__label {
  flex: 1;
  text-align: left;
}

@media (prefers-reduced-motion: reduce) {
  [data-dk-menu-item] {
    transition: none;
  }
}
```

Add to `src/styles.css` (after the `button-sizes.css` import):

```css
@import "./styles/button-sizes.css";
@import "./styles/menu-tokens.css";
@import "./styles/menu-content.css";
@import "./styles/menu-item.css";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/styles.test.ts src/structure.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/styles/menu-tokens.css src/styles/menu-content.css src/styles/menu-item.css src/styles.css src/styles.test.ts src/structure.test.ts
git commit -m "feat(menu): content-sized surface + item styles and tokens"
```

---

## Task 9: Full suite + verify gate

**Files:** none (verification only).

- [ ] **Step 1: Run the whole unit suite**

Run: `npx vitest run`
Expected: PASS — all prior suites plus the new `src/menu/**` tests.

- [ ] **Step 2: Lint + typecheck**

Run: `npx eslint . && npx tsc --noEmit`
Expected: no errors. If any `src/menu/*` file exceeds 120 effective lines, split it (e.g. move the focus effect into a hook) and re-run.

- [ ] **Step 3: Build + package gate**

Run: `pnpm verify`
Expected: build emits `Menu` types into `dist/index.d.ts`; `publint` reports "All good!"; `pnpm pack --dry-run` lists the three `dist/styles/menu-*.css` files.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test(menu): green full verify gate for M2 core"
```

---

## Task 10: Browser verification (temporary review route)

**Files:**
- Create (temporary): `app/menu-review/page.tsx`

- [ ] **Step 1: Create the review route**

```tsx
// app/menu-review/page.tsx
"use client";

import { Menu } from "@/src";

export default function MenuReview() {
  return (
    <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", background: "#eceef1" }}>
      <Menu>
        <Menu.Trigger
          aria-label="Acciones"
          style={{ width: 52, height: 52, borderRadius: 26, border: "none", background: "#1c1c1e", color: "#fff", fontSize: 28, cursor: "pointer" }}
        >
          +
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Item onSelect={() => console.log("abrir")}>Abrir</Menu.Item>
          <Menu.Item onSelect={() => console.log("dup")}>Duplicar el elemento</Menu.Item>
          <Menu.Item disabled>Compartir con todos</Menu.Item>
          <Menu.Item destructive onSelect={() => console.log("del")}>Eliminar</Menu.Item>
        </Menu.Content>
      </Menu>
    </main>
  );
}
```

- [ ] **Step 2: Start the dev server and confirm it serves**

Run:
```bash
pnpm exec next dev -p 3005 &
for i in $(seq 1 40); do curl -sf -o /dev/null http://localhost:3005/menu-review && break; sleep 1; done
curl -sf -o /dev/null -w "menu-review HTTP %{http_code}\n" http://localhost:3005/menu-review
```
Expected: `menu-review HTTP 200`.

- [ ] **Step 3: Verify the morph in a real browser**

Open `http://localhost:3005/menu-review` and click the `+`. Expected: the button morphs (size-based, crisp text, springy) into a content-sized menu; items stagger in; clicking an item or outside, or pressing Esc, closes it back. Toggle OS reduced-motion to confirm the crossfade fallback. Screenshot the open state for the record.

- [ ] **Step 4: Remove the temporary route and stop the server**

```bash
rm -f app/menu-review/page.tsx && rmdir app/menu-review 2>/dev/null
pkill -f "next dev"
rm -rf .next/dev/types .next/types
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(menu): verify M2 morph in browser (temporary route removed)"
```

---

## Self-review (completed by plan author)

**Spec coverage (M2 slice):**
- Compound API (`Menu`/`Trigger`/`Content`/`Item`) → Tasks 3, 4, 6, 5, 7.
- Controlled/uncontrolled open + phase → Tasks 1, 3.
- Portal + size morph (crisp) → Task 6 (uses M1 `usePortalNode`, `useMorph`).
- Non-modal dismiss (outside-click + Esc) → Task 6 (`useDismiss`).
- First-item focus on open + restore trigger on close → Task 6.
- `role="menu"`/`menuitem`, `aria-haspopup`/`expanded`/`controls`/`labelledby`, `aria-orientation` → Tasks 4, 5, 6.
- `disabled` + `destructive` items → Task 5 (+ styles Task 8).
- Reduced-motion → M1 `runSizeMorph` + item CSS (Task 8).
- Tokens/CSS + import order + structure/style tests → Task 8.
- Verify gate + browser proof → Tasks 9, 10.
- **Deferred to M3:** collision-aware placement + `side`/`align` behavior (props accepted, positioned at trigger for now), full roving keyboard (↑/↓/Home/End).

**Placeholder scan:** none — every code step has full source.

**Type consistency:** `MorphPhase` is imported from `../morph/useMorph` (M1) in `Menu.types.ts` and re-exported; `MenuContextValue` (Task 2) is used by root (Task 3) and consumed by trigger/item/content (Tasks 4–6); `MenuContentProps` flows from types (Task 2) → surface/gate (Task 6). `usePortalNode`/`useMorph`/`useDismiss` signatures match their M1 definitions.

**Open items:** the menu surface uses `--dk-color-surface-raised` (themed light/dark) rather than the always-dark mock aesthetic — a deliberate library default, tunable via `--dk-menu-surface`. Fixed placement (panel at the trigger, grows down-right) is the M2 stand-in until M3's collision logic.
