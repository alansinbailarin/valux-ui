"use client";

import {
  Button,
  Checkbox,
  Input,
  Menu,
  Radio,
  RadioGroup,
  Select,
  Switch,
  toast,
} from "@/src";

const PLANS = [
  { value: "free", label: "Free", description: "For side projects." },
  { value: "pro", label: "Pro", description: "Unlimited projects." },
  { value: "team", label: "Team", description: "Up to 20 seats." },
];

/** The live board: every control below derives from the studio theme. */
export function StudioBoard() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
          <section
            className="space-y-3 rounded-3xl p-5"
            style={{ background: "var(--vx-color-surface)" }}
          >
            <p className="text-xs font-semibold tracking-widest uppercase opacity-50">Buttons</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button color="primary">Continue</Button>
              <Button variant="soft">Duplicate</Button>
              <Button variant="outline">Share</Button>
              <Button variant="ghost">Dismiss</Button>
              <Button color="danger" variant="soft">Delete</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" color="primary" loading>Saving</Button>
              <Button size="sm" variant="soft" disabled>Disabled</Button>
              <Menu>
                <Menu.Trigger asChild>
                  <Button size="sm" variant="outline">Options ▾</Button>
                </Menu.Trigger>
                <Menu.Content>
                  <Menu.Item onSelect={() => toast("Renamed")}>Rename</Menu.Item>
                  <Menu.Item onSelect={() => toast("Duplicated")}>Duplicate</Menu.Item>
                  <Menu.Separator />
                  <Menu.Item destructive onSelect={() => toast({ title: "Deleted", tone: "danger" })}>
                    Delete
                  </Menu.Item>
                </Menu.Content>
              </Menu>
            </div>
          </section>

          <section
            className="space-y-3 rounded-3xl p-5"
            style={{ background: "var(--vx-color-surface)" }}
          >
            <p className="text-xs font-semibold tracking-widest uppercase opacity-50">Fields</p>
            <Input label="Email" type="email" placeholder="you@studio.dev" hint="We never share it." />
            <Select options={PLANS} defaultValue="pro">
              <Select.Trigger label="Plan" size="sm" />
              <Select.Content />
            </Select>
          </section>

          <section
            className="space-y-3 rounded-3xl p-5"
            style={{ background: "var(--vx-color-surface)" }}
          >
            <p className="text-xs font-semibold tracking-widest uppercase opacity-50">Selection</p>
            <div className="flex flex-col items-start gap-2.5">
              <Switch label="Push notifications" defaultChecked />
              <Checkbox label="Accept the terms" defaultChecked />
              <RadioGroup label="Billing" defaultValue="yearly">
                <div className="flex items-center gap-5">
                  <Radio value="monthly" label="Monthly" />
                  <Radio value="yearly" label="Yearly" />
                </div>
              </RadioGroup>
            </div>
          </section>

          <section
            className="space-y-3 rounded-3xl p-5"
            style={{ background: "var(--vx-color-surface)" }}
          >
            <p className="text-xs font-semibold tracking-widest uppercase opacity-50">Feedback</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="soft"
                onClick={() =>
                  toast({ title: "Changes saved", description: "Your theme is safe.", tone: "success" })
                }
              >
                Success toast
              </Button>
              <Button
                size="sm"
                variant="soft"
                onClick={() =>
                  toast.promise(new Promise((resolve) => setTimeout(resolve, 1800)), {
                    loading: "Publishing…",
                    success: "Published",
                    error: "Failed",
                  })
                }
              >
                Promise toast
              </Button>
            </div>
            <p className="text-sm leading-6 opacity-60">
              Every hover, wash, and focus ring on this board derives from the
              single primary you picked — no per-component overrides.
            </p>
          </section>
        </div>
  );
}
