"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { NAV_SECTIONS } from "./nav-items";
import { cn } from "@/lib/cn";

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-[var(--sidebar-bg)] text-[var(--sidebar-fg)]">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">MJ Ofertas</p>
          <p className="text-xs text-[var(--sidebar-fg)]/70">Painel de gestão</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--sidebar-fg)]/50">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
                      active
                        ? "bg-brand text-white"
                        : "text-[var(--sidebar-fg)] hover:bg-white/5"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </span>
                    {!item.implemented && (
                      <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-[var(--sidebar-fg)]/70">
                        {item.phase}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed h-screen w-64">
          <SidebarContent />
        </div>
      </aside>

      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg bg-[var(--sidebar-bg)] p-2 text-white shadow-lg lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72">
            <div className="relative h-full">
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-4 rounded-lg p-1.5 text-white/70 hover:bg-white/10"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
