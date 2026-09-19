# Getting started

Valux UI is a zero-dependency React component library for modern
Next.js applications: accessible components with a native-mobile feel and
one shared motion signature (panels morph out of their triggers).

## Install

```bash
pnpm add @valux/ui   # or: npm install Valux UI UI / yarn add Valux UI UI
```

Requires React 18 or 19. Works in any React app; examples below use the
Next.js App Router.

## Setup (once, at the root)

Import the stylesheet, wrap the app in `ValuxProvider`, and mount
`Toaster` once if you use toasts:

```tsx
// app/layout.tsx
import "@valux/ui/styles.css";
import { ValuxProvider, Toaster } from "@valux/ui";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ValuxProvider theme={{ mode: "system", color: { primary: "#4f46e5" } }}>
          {children}
          <Toaster position="top" />
        </ValuxProvider>
      </body>
    </html>
  );
}
```

- The provider is **server-safe** (renders a plain `div` with data
  attributes + CSS variables) — the root layout can stay a Server
  Component.
- Interactive components (`Menu`, `Dialog`, `Sheet`, `Popover`, `Tooltip`)
  are client components internally; you can render them from Server
  Components without adding `"use client"` yourself. Add it only to YOUR
  files when they use hooks or handlers.
- Mount `Toaster` exactly ONCE. Then call `toast(...)` from anywhere — no
  hooks, no context.

## First components

```tsx
import { Button, Dialog, Menu, toast } from "@valux/ui";

<Button color="primary" onClick={() => toast("Saved")}>Save</Button>

<Menu>
  <Menu.Trigger asChild><Button variant="soft">Options</Button></Menu.Trigger>
  <Menu.Content>
    <Menu.Item onSelect={() => {}}>Rename</Menu.Item>
    <Menu.Item destructive onSelect={() => {}}>Delete</Menu.Item>
  </Menu.Content>
</Menu>

<Dialog>
  <Dialog.Trigger asChild><Button color="primary">Edit profile</Button></Dialog.Trigger>
  <Dialog.Content size="sm">
    <Dialog.Title>Edit profile</Dialog.Title>
    <Dialog.Description>Update your visible name.</Dialog.Description>
    <Dialog.Body>{/* form */}</Dialog.Body>
    <Dialog.Footer>
      <Dialog.Close asChild><Button color="primary">Save</Button></Dialog.Close>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog>
```

## Kit conventions (IMPORTANT for generated code)

These are deliberate design rules — code that follows them looks and feels
like Valux UI; code that fights them does not:

1. **One radius for everything.** There is NO `radius`/`rounded` prop
   anywhere and no size scale for corners. The whole kit shares one
   pronounced token (`--vx-radius-control`, 1rem); panels are 1.5×.
2. **Dialogs never have a Cancel button.** The built-in X (top-right) is
   the one dismiss control. Footers hold confirm actions only (via
   `Dialog.Close`).
3. **Sheet is its own component, not a Dialog variant.** Bottom sheets
   slide up from the edge (`Sheet` + detents `half`/`full`, optional
   `expandable`); dialogs morph out of their trigger.
4. **Triggers use `asChild`** to wrap your own button/element instead of
   nesting buttons.
5. **Toasts queue.** One on stage at a time by default; the rest wait
   behind as stacked cards and pass to the front — never render toast
   lists yourself, never mount multiple `Toaster`s.
6. **Pull-to-close is built in.** Menus, dialogs, and sheets close with
   touch/trackpad pull gestures; do not add your own swipe-to-close.
7. **Theming is tokens, not props.** Brand color, density, dark mode, and
   font come from the provider theme; components have no per-instance
   color overrides beyond their documented `color`/`tone` props.
8. **Reduced motion is automatic.** Every animation swaps for an instant
   crossfade under `prefers-reduced-motion` — no configuration needed.

## TypeScript

Everything ships typed (ESM + CJS). Notable exports: component props
(`ButtonProps`, `DialogContentProps`, …), `ValuxTheme`,
`ToastOptions`, and the `toast` API (`toast`, `toast.promise`,
`toast.dismiss`).
