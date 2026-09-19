"use client";

import {
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  DocumentPlusIcon,
  EllipsisHorizontalIcon,
  FolderPlusIcon,
  PencilSquareIcon,
  PlusIcon,
  ShareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { Button, Menu } from "@/src";

import { MenuShowroomList } from "./MenuShowroomList";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="mb-4 font-mono text-xs tracking-[0.2em] text-zinc-400 uppercase">
        {title}
      </p>
      {children}
    </section>
  );
}

export function MenuShowroom() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* <Card title="FAB · crear">
        <div className="relative h-72 overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200">
          <p className="p-4 text-sm text-zinc-400">Tus notas</p>
          <div className="absolute right-5 bottom-5">
            <Menu>
              <Menu.Trigger asChild>
                <Button
                  color="primary"
                  iconOnly
                  aria-label="Crear"
                  style={{ width: 56, height: 56, borderRadius: 999 }}
                >
                  <PlusIcon />
                </Button>
              </Menu.Trigger>
              <Menu.Content surface="trigger">
                <Menu.Item icon={<DocumentPlusIcon />}>Nueva nota</Menu.Item>
                <Menu.Item icon={<FolderPlusIcon />}>Nueva carpeta</Menu.Item>
                <Menu.Item icon={<ArrowDownTrayIcon />}>Importar archivo</Menu.Item>
              </Menu.Content>
            </Menu>
          </div>
        </div>
      </Card> */}

      <Card title="Hey Jude">
        <div className="flex items-center justify-between rounded-2xl border border-zinc-200 p-4">
          <div>
            <p className="text-sm font-semibold text-zinc-800">Chi?.pdf</p>
            <p className="text-xs text-zinc-400">2.4 MB · ayer</p>
          </div>
          <Menu>
            <Menu.Trigger asChild>
              <Button
                variant="ghost"
                iconOnly
                aria-label="Acciones del documento"
                style={{ borderRadius: 999 }}
              >
                <EllipsisHorizontalIcon />
              </Button>
            </Menu.Trigger>
            <Menu.Content>
              <Menu.Label>Documento</Menu.Label>
              <Menu.Item icon={<ShareIcon />} shortcut="⌘S">
                Compartir
              </Menu.Item>
              <Menu.Item icon={<DocumentDuplicateIcon />} shortcut="⌘D">
                Duplicar
              </Menu.Item>
              <Menu.Item icon={<PencilSquareIcon />} disabled>
                Renombrar
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item icon={<TrashIcon />} destructive shortcut="⌫">
                Eliminar
              </Menu.Item>
            </Menu.Content>
          </Menu>
        </div>
      </Card>

      {/* <Card title="Lista · selector de rol">
        <MenuShowroomList />
      </Card> */}
    </div>
  );
}
