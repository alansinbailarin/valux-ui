/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Menu } from "@/src";
import { Copy, Pen, Trash2 } from "lucide-react";
import type { Specimen } from "./specimenTypes";

export const MENU_SPECIMEN: Specimen = {
  id: "menu",
  label: "Menu",
  description: "Contextual pop-up list of actions or commands, seamlessly anchored to a trigger with dynamic viewport positioning",
  height: 180,
  node: (
    <Menu>
      <Menu.Trigger asChild>
        <Button color="primary">Options</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Label>Document</Menu.Label>
        <Menu.Item icon={<Pen size={18} strokeWidth={2} />} shortcut="⌘E">Edit</Menu.Item>
        <Menu.Item icon={<Copy size={18} strokeWidth={2} />} shortcut="⌘D">Duplicate</Menu.Item>
        <Menu.Separator />
        <Menu.Item icon={<Trash2 size={18} strokeWidth={2} />} destructive shortcut="⌫">Delete</Menu.Item>
      </Menu.Content>
    </Menu>
  ),
  controls: [
    { kind: "options", prop: "side", options: ["top", "bottom", "left", "right", "auto"], initial: "auto" },
    { kind: "options", prop: "align", options: ["start", "center", "end", "auto"], initial: "auto" },
    { kind: "options", prop: "surface", options: ["auto", "trigger"], initial: "auto" },
  ],
  render: (v) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '2rem 0' }}>
        <Menu>
          <Menu.Trigger asChild>
            <Button color="primary">Options</Button>
          </Menu.Trigger>
          <Menu.Content 
            side={v.side as any}
            align={v.align as any}
            surface={v.surface as "auto" | "trigger"}
          >
            <Menu.Label>Document</Menu.Label>
            <Menu.Item icon={<Pen size={18} strokeWidth={2} />} shortcut="⌘E">Edit</Menu.Item>
            <Menu.Item icon={<Copy size={18} strokeWidth={2} />} shortcut="⌘D">Duplicate</Menu.Item>
            <Menu.Separator />
            <Menu.Item icon={<Trash2 size={18} strokeWidth={2} />} destructive shortcut="⌫">Delete</Menu.Item>
          </Menu.Content>
        </Menu>
      </div>
    );
  },
  renderSnippet: (v) => {
    const props = [];
    if (v.side && v.side !== "auto") props.push(`side="${v.side}"`);
    if (v.align && v.align !== "auto") props.push(`align="${v.align}"`);
    if (v.surface && v.surface !== "auto") props.push(`surface="${v.surface}"`);
    const propsString = props.length > 0 ? ` ${props.join(" ")}` : "";

    const code = `import { Button, Menu } from "@valux/ui";
import { Copy, Pen, Trash2 } from "lucide-react";

export function Example() {
  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button color="primary">Options</Button>
      </Menu.Trigger>
      <Menu.Content${propsString}>
        <Menu.Label>Document</Menu.Label>
        <Menu.Item icon={<Pen size={18} strokeWidth={2} />} shortcut="⌘E">Edit</Menu.Item>
        <Menu.Item icon={<Copy size={18} strokeWidth={2} />} shortcut="⌘D">Duplicate</Menu.Item>
        <Menu.Separator />
        <Menu.Item icon={<Trash2 size={18} strokeWidth={2} />} destructive shortcut="⌫">Delete</Menu.Item>
      </Menu.Content>
    </Menu>
  );
}
`;
    return [{ tok: "plain", text: code }];
  }
};
