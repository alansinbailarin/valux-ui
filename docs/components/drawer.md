# Drawer

The Sheet's sibling for the SIDES: a floating full-height card that
slides in from the left or right edge — navigation, carts, filter rails.
Like the Sheet, it stays DETACHED from the screen: an outer gutter on
every side (safe-area aware) with the full panel radius on all corners.

```tsx
import { Button, Drawer } from "@valux/ui";

<Drawer>
  <Drawer.Trigger asChild>
    <Button>Cart</Button>
  </Drawer.Trigger>
  <Drawer.Content side="right" size="md">
    <Drawer.Header>
      <Drawer.Title>Cart</Drawer.Title>
      <Drawer.Description>2 items ready.</Drawer.Description>
    </Drawer.Header>
    <Drawer.Body>{/* long content scrolls here */}</Drawer.Body>
    <Drawer.Footer>
      <Drawer.Close asChild>
        <Button color="primary">Checkout</Button>
      </Drawer.Close>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer>
```

## API

- **`Drawer`** — root: `open` / `defaultOpen` / `onOpenChange`.
- **`Drawer.Trigger`** — native button or `asChild`.
- **`Drawer.Content`** — `side` (`"left" | "right"`, default right),
  `size` (`"sm"` 18rem · `"md"` 22rem · `"lg"` 28rem, clamped to the
  viewport minus gutters), `dismissable`, `closeLabel` for the built-in
  X (the one dismiss control — never add a Cancel button).
- **`Drawer.Header` / `Body` / `Footer`** — pinned chrome, one scroll
  region with the family's top fog; the footer stacks on narrow screens.
- **`Drawer.Title` / `Drawer.Description`** — wire the dialog's
  accessible name/description automatically.
- **`Drawer.Close`** — closes from inside (`asChild` supported).

## Behavior

- Modal like the Sheet: scrim, iOS-proof scroll lock, inert background,
  focus trap and focus return; Esc and outside click dismiss the topmost
  layer only.
- Slides in from its edge with the glass off while moving (mobile frame
  rates), floating gutters included in the travel.
- PULL sideways to dismiss: drag the panel toward its edge (touch) or
  two-finger horizontal swipe (trackpad). Short of a third of its width
  it springs back; past it — or with a flick — it commits. Vertical
  scrolling inside always wins over the gesture.
- Reduced motion swaps the slide for an instant appearance.
