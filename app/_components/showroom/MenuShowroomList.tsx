"use client";

import { useState } from "react";
import { Button, Menu } from "@/src";

const ROLES = ["Admin", "Editor", "Lector"] as const;
type Role = (typeof ROLES)[number];

/** Select-style trigger: shows the current value; items switch it (check on
 * the active one). */
function RoleSelect({
  value,
  onChange,
}: {
  value: Role;
  onChange: (role: Role) => void;
}) {
  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button variant="soft" size="sm" style={{ borderRadius: 999, minWidth: 110 }}>
          {value}
        </Button>
      </Menu.Trigger>
      <Menu.Content align="end">
        {ROLES.map((role) => (
          <Menu.Item key={role} onSelect={() => onChange(role)}>
            {role}
          </Menu.Item>
        ))}
      </Menu.Content>
    </Menu>
  );
}

export function MenuShowroomList() {
  const [roles, setRoles] = useState<Record<string, Role>>({
    "Ana Torres": "Admin",
    "Luis Vega": "Editor",
  });

  return (
    <ul className="divide-y divide-zinc-100">
      {Object.entries(roles).map(([name, role]) => (
        <li key={name} className="flex items-center justify-between py-3">
          <span className="text-sm text-zinc-700">{name}</span>
          <RoleSelect
            value={role}
            onChange={(next) => setRoles((all) => ({ ...all, [name]: next }))}
          />
        </li>
      ))}
    </ul>
  );
}
