# Motion & gestures

One motion signature runs through the kit. Understanding it explains what
you see — and what the gestures do.

## The morph (Menu, Dialog)

The trigger visually becomes the panel. Open: anticipation dip → the body
stretches into a blurred streak and travels → unfolds with a spring (a
slight overshoot, except fullscreen dialogs, which land exactly at final
size) → the glass (translucent surface + backdrop blur) fades in as part of
the settle. Close: the reverse, with the trigger's content traveling inside
the returning body as a "ghost" and the real trigger revealing in a
crossfade exactly beneath the landing.

Implementation notes that matter to consumers:

- Everything is WAAPI keyframes; the body travels **opaque** (the settled
  glass color composited over the page around the trigger) and with the
  backdrop blur off — the glass develops only at the settle. This keeps
  mobile GPUs at frame rate.
- Color is part of the morph: the body interpolates trigger ↔ panel
  background, so there is never a color snap — including `surface="trigger"`.
- The landing radius is scale-compensated per axis, so the compressed body
  renders exactly the trigger's rounding (a plain pill radius deforms under
  non-uniform scale).
- Presets: Menu 500ms open / 460ms close; Dialog 540/460. On touch devices
  the engine automatically shortens durations (~12%) and lightens the streak
  blur (~40%).
- `prefers-reduced-motion` replaces every morph with an instant swap.

## Pull-to-close (Menu, Dialog)

Drag down with a finger (touch) or swipe down with two fingers (trackpad,
inside or outside the panel). The gesture does not translate the panel — it
**scrubs the return morph itself** through its first half.

The logic, precisely:

1. The gesture only begins when nothing under the pointer can still scroll
   up. Inside a scrolled `Dialog.Body`, swiping down first scrolls the
   content back to its top; only then does the same continued gesture start
   closing. Outside the panel, it always begins immediately.
2. While engaged, gesture distance maps to morph progress (260px ≈ half the
   close animation). Scrolling is suppressed for the duration.
3. Release/stop short of the commit point (45%) — or pull back up — and the
   morph rewinds to fully open.
4. Cross the commit point (or flick hard) and the rest of the close plays
   immediately. Trailing trackpad inertia is swallowed so it cannot nudge
   the page.

## Sheet gestures

The sheet's return IS a slide, so the panel follows the finger directly.
Same scroll-chain rule as above; release past a third of its height (or
flick) to dismiss, earlier to spring back. With `expandable`, upward pulls
grow the sheet continuously and the **midpoint** decides on release; while
expanded, pulling down collapses first, and a further pull dismisses.

## Scroll fog

`Dialog.Body` / `Sheet.Body` show a progressive blur strip at their top
edge only once scrolled — at the very top there is nothing; scrolled
content slides under the fog.

## Point bloom (ContextMenu)

Surfaces that bloom from a POINT (no trigger element) use a crisper
preset — shorter flight, far less blur — and the opaque travel color so
the body never reads as a gray see-through. On close there is nothing to
reveal, so the CONTENT stays aboard (dimmed, lightly blurred) and
visibly crushes into the point with the shrinking body. Morph presets
are per-surface: Menu, Dialog, and the point bloom each carry their own
personality.

## Toast liquid (generation & queue)

The toast SILHOUETTE generates itself: the title pill morphs in, the
panel stretches out of it (goo-fused), text breathes last; exits reabsorb.
Queued toasts stack behind as complete cards and PASS TO THE FRONT when
promoted — the same element slides forward, no re-entrance.

## Switch lens & physics

Pressing stretches the chip toward the empty side (iOS squish). Dragging
turns it into a liquid lens: it scales past the track as translucent
glass (backdrop blur) while the fill color follows the finger; release
past the midpoint commits. Touch devices get a cheaper blur.

## Selection family

The checkbox's checkmark draws itself (stroke-dash), the indeterminate
bar slides in, and the radio dot pops with the house overshoot. Pressing
any of them dips the control like a key. All marks/dots use the SURFACE
color over a primary fill — the inverted look shared with the Switch
chip.
