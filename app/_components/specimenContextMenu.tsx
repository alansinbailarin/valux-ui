import { ContextMenu, Menu } from "@/src";
import { Copy, Pen, Trash2 } from "lucide-react";
import type { Specimen } from "./specimenTypes";

export const CONTEXT_MENU_SPECIMEN: Specimen = {
  id: "contextmenu",
  label: "ContextMenu",
  description: "Floating action menu summoned exactly where the pointer rests upon right-click or long-press interactions",
  height: 230,
  node: (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <ContextMenu>
        <ContextMenu.Trigger className="specimen-pad" style={{ width: "100%", height: "10rem", background: "color-mix(in srgb, var(--vx-color-on-surface) 5%, transparent)", display: "grid", placeItems: "center" }}>
          ContextMenu
        </ContextMenu.Trigger>
        <Menu.Content>
          <Menu.Item icon={<Pen size={18} strokeWidth={2} />}>Edit</Menu.Item>
          <Menu.Item icon={<Copy size={18} strokeWidth={2} />}>Duplicate</Menu.Item>
          <Menu.Separator />
          <Menu.Item destructive icon={<Trash2 size={18} strokeWidth={2} />}>Delete</Menu.Item>
        </Menu.Content>
      </ContextMenu>
    </div>
  ),
  controls: [
    { kind: "options", prop: "side", options: ["top", "bottom", "left", "right", "auto"], initial: "auto" },
    { kind: "options", prop: "align", options: ["start", "center", "end", "auto"], initial: "auto" },
  ],
  render: (v) => {
    return (
      <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: "2rem 0" }}>
        <ContextMenu>
          <ContextMenu.Trigger className="specimen-pad" style={{ width: "100%", height: "10rem", background: "color-mix(in srgb, var(--vx-color-on-surface) 5%, transparent)", display: "grid", placeItems: "center", border: "1px dashed color-mix(in srgb, var(--vx-color-on-surface) 20%, transparent)", borderRadius: "var(--vx-radius-container)" }}>
            ContextMenu
          </ContextMenu.Trigger>
          <Menu.Content
            side={v.side as "auto"}
            align={v.align as "auto"}
          >
            <Menu.Item icon={<Pen size={18} strokeWidth={2} />} shortcut="⌘E">Edit</Menu.Item>
            <Menu.Item icon={<Copy size={18} strokeWidth={2} />} shortcut="⌘D">Duplicate</Menu.Item>
            <Menu.Separator />
            <Menu.Item icon={<Trash2 size={18} strokeWidth={2} />} destructive shortcut="⌫">Delete</Menu.Item>
          </Menu.Content>
        </ContextMenu>
      </div>
    );
  },
  renderSnippet: (v) => {
    const props = [];
    if (v.side && v.side !== "auto") props.push(`side="${v.side}"`);
    if (v.align && v.align !== "auto") props.push(`align="${v.align}"`);
    const propsString = props.length > 0 ? ` ${props.join(" ")}` : "";

    const code = `import { ContextMenu, Menu } from "@valux/ui";
import { Copy, Pen, Trash2 } from "lucide-react";

export function Example() {
  return (
    <ContextMenu>
      <ContextMenu.Trigger className="zone">
        ContextMenu
      </ContextMenu.Trigger>
      <Menu.Content${propsString}>
        <Menu.Item icon={<Pen size={18} strokeWidth={2} />} shortcut="⌘E">Edit</Menu.Item>
        <Menu.Item icon={<Copy size={18} strokeWidth={2} />} shortcut="⌘D">Duplicate</Menu.Item>
        <Menu.Separator />
        <Menu.Item icon={<Trash2 size={18} strokeWidth={2} />} destructive shortcut="⌫">Delete</Menu.Item>
      </Menu.Content>
    </ContextMenu>
  );
}
`;
    return [{ tok: "plain", text: code }];
  }
};
