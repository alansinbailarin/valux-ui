/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Tooltip } from "@/src";
import type { Specimen } from "./specimenTypes";

export const TOOLTIP_SPECIMEN: Specimen = {
  id: "tooltip",
  label: "Tooltip",
  description: "Non-interactive floating label that provides additional context or keyboard shortcuts on hover and focus",
  height: 200,
  node: (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <span style={{ cursor: "help", borderBottom: "1px dotted currentColor" }}>
          Tooltip
        </span>
      </Tooltip.Trigger>
      <Tooltip.Content>This is a tooltip</Tooltip.Content>
    </Tooltip>
  ),
  controls: [
    { kind: "options", prop: "side", options: ["top", "bottom", "left", "right"], initial: "top" },
    { kind: "options", prop: "align", options: ["start", "center", "end"], initial: "center" },
  ],
  render: (v) => {
    return (
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button variant="soft">Tooltip</Button>
        </Tooltip.Trigger>
        <Tooltip.Content side={v.side as any} align={v.align as any}>
          Contextual info here
        </Tooltip.Content>
      </Tooltip>
    );
  },
  renderSnippet: (v) => {
    const props = [];
    if (v.side && v.side !== "top") props.push(`side="${v.side}"`);
    if (v.align && v.align !== "center") props.push(`align="${v.align}"`);
    const propsString = props.length > 0 ? ` ${props.join(" ")}` : "";

    const code = `import { Button, Tooltip } from "@valux/ui";

export function Example() {
  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <Button variant="soft">Tooltip</Button>
      </Tooltip.Trigger>
      <Tooltip.Content${propsString}>
        Contextual info here
      </Tooltip.Content>
    </Tooltip>
  );
}
`;
    return [{ tok: "plain", text: code }];
  }
};
