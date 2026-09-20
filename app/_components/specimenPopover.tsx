/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Popover } from "@/src";
import type { Specimen } from "./specimenTypes";

const POPOVER_INNER = (
  <div style={{ padding: '1.25rem', width: '16rem' }}>
    <h4 style={{ margin: '0 0 0.5rem 0' }}>Popover</h4>
    <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'color-mix(in srgb, var(--vx-color-on-surface) 70%, transparent)' }}>
      Adjust the widget behavior here.
    </p>
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
      <Popover.Close asChild>
        <Button variant="soft">Cancel</Button>
      </Popover.Close>
      <Button variant="outline">Apply</Button>
    </div>
  </div>
);

export const POPOVER_SPECIMEN: Specimen = {
  id: "popover",
  label: "Popover",
  description: "Rich unconstrained overlay designed for complex forms, nested content, and custom configurations that exceed a menu",
  height: 230,
  node: (
    <Popover>
      <Popover.Trigger asChild>
        <Button color="primary">Popover</Button>
      </Popover.Trigger>
      <Popover.Content>
        {POPOVER_INNER}
      </Popover.Content>
    </Popover>
  ),
  controls: [
    { kind: "options", prop: "side", options: ["top", "bottom", "left", "right", "auto"], initial: "auto" },
    { kind: "options", prop: "align", options: ["start", "center", "end", "auto"], initial: "auto" },
    { kind: "options", prop: "surface", options: ["auto", "trigger"], initial: "auto" },
    { kind: "flag", prop: "dismissable" },
  ],
  render: (v) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '2rem 0' }}>
        <Popover>
          <Popover.Trigger asChild>
            <Button color="primary">Popover</Button>
          </Popover.Trigger>
          <Popover.Content 
            side={v.side as any}
            align={v.align as any}
            surface={v.surface as "auto" | "trigger"}
            dismissable={v.dismissable !== false}
          >
            {POPOVER_INNER}
          </Popover.Content>
        </Popover>
      </div>
    );
  },
  renderSnippet: (v) => {
    const props = [];
    if (v.side && v.side !== "auto") props.push(`side="${v.side}"`);
    if (v.align && v.align !== "auto") props.push(`align="${v.align}"`);
    if (v.surface && v.surface !== "auto") props.push(`surface="${v.surface}"`);
    if (v.dismissable === false) props.push(`dismissable={false}`);
    const propsString = props.length > 0 ? ` ${props.join(" ")}` : "";

    const code = `import { Button, Popover } from "@valux/ui";

export function Example() {
  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button color="primary">Popover</Button>
      </Popover.Trigger>
      <Popover.Content${propsString}>
        <div style={{ padding: '1.25rem', width: '16rem' }}>
          <h4>Popover</h4>
          <p>Adjust the widget behavior here.</p>
          <Popover.Close asChild>
            <Button variant="soft">Close</Button>
          </Popover.Close>
        </div>
      </Popover.Content>
    </Popover>
  );
}
`;
    return [{ tok: "plain", text: code }];
  }
};
