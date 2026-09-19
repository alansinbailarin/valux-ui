import { Button, Drawer, Card } from "@/src";
import { BellIcon } from "@heroicons/react/20/solid";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import type { Specimen } from "./specimenTypes";

const DRAWER_INNER = (
  <>
    <Drawer.Header>
      <Drawer.Title>Notifications</Drawer.Title>
      <Drawer.Description>You have 2 unread messages.</Drawer.Description>
    </Drawer.Header>
    <Drawer.Body>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Card variant="soft" padding="none">
          <div style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--vx-color-primary-base)', marginTop: '0.25rem' }}>
              <CheckCircleIcon width={24} height={24} />
            </div>
            <div>
              <p style={{ margin: '0 0 0.25rem', fontWeight: 500 }}>Build successful</p>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'color-mix(in srgb, var(--vx-color-on-surface) 70%, transparent)' }}>
                The deployment completed successfully in 45s.
              </p>
            </div>
          </div>
        </Card>
        <Card variant="outline" padding="none">
          <div style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--vx-color-warning-base)', marginTop: '0.25rem' }}>
              <ExclamationTriangleIcon width={24} height={24} />
            </div>
            <div>
              <p style={{ margin: '0 0 0.25rem', fontWeight: 500 }}>High memory usage</p>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'color-mix(in srgb, var(--vx-color-on-surface) 70%, transparent)' }}>
                Server is at 95% capacity.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Drawer.Body>
    <Drawer.Footer style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
      <Drawer.Close asChild>
        <Button variant="soft">Mark all as read</Button>
      </Drawer.Close>
    </Drawer.Footer>
  </>
);

export const DRAWER_SPECIMEN: Specimen = {
  id: "drawer",
  label: "Drawer",
  description: "Side-anchored panel optimized for desktop navigation, dense settings menus, or persistent shopping carts",
  height: 230,
  node: (
    <Drawer>
      <Drawer.Trigger asChild>
        <Button color="primary">View Notifications</Button>
      </Drawer.Trigger>
      <Drawer.Content size="sm">
        {DRAWER_INNER}
      </Drawer.Content>
    </Drawer>
  ),
  controls: [
    { kind: "options", prop: "side", options: ["left", "right"], initial: "right" },
    { kind: "options", prop: "size", options: ["sm", "md", "lg"], initial: "md" },
    { kind: "flag", prop: "dismissable" },
  ],
  render: (v) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '2rem 0' }}>
        <Drawer>
          <Drawer.Trigger asChild>
            <Button color="primary">View Notifications</Button>
          </Drawer.Trigger>
          <Drawer.Content 
            side={v.side as "left" | "right"}
            size={v.size as "sm" | "md" | "lg"}
            dismissable={v.dismissable !== false}
          >
            {DRAWER_INNER}
          </Drawer.Content>
        </Drawer>
      </div>
    );
  },
  renderSnippet: (v) => {
    const props = [];
    if (v.side && v.side !== "right") props.push(`side="${v.side}"`);
    if (v.size && v.size !== "md") props.push(`size="${v.size}"`);
    if (v.dismissable === false) props.push(`dismissable={false}`);
    const propsString = props.length > 0 ? ` ${props.join(" ")}` : "";

    const code = `import { Button, Drawer, Card } from "@valux/ui";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";

export function Example() {
  return (
    <Drawer>
      <Drawer.Trigger asChild>
        <Button color="primary">View Notifications</Button>
      </Drawer.Trigger>
      <Drawer.Content${propsString}>
        <Drawer.Header>
          <Drawer.Title>Notifications</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          {/* ... Card items ... */}
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  );
}
`;
    return [{ tok: "plain", text: code }];
  }
};
