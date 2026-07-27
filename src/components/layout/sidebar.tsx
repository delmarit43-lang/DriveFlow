"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Plus, X } from "lucide-react";
import { mainNav, secondaryNav } from "@/constants/navigation";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { useVehicleDialog } from "@/components/vehicles/vehicle-dialog-provider";
import { useFleet } from "@/store/fleet-store";
import { cn } from "@/lib/utils";

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { openCreate } = useVehicleDialog();
  const { notifications } = useFleet();
  const unread = notifications.filter((n) => !n.read).length;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const linkClass = (href: string, small?: boolean) =>
    cn(
      "flex items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
      small ? "py-2" : "py-2.5",
      isActive(href) ? "bg-sidebar-accent text-white" : "text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-white",
    );

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-sidebar flex-col bg-sidebar px-4 py-6 text-sidebar-foreground transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-sidebar-muted transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="mt-8 flex-1 space-y-1 overflow-y-auto" aria-label="Main">
          {mainNav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={onClose} className={linkClass(href)}>
              <Icon className="size-[18px] shrink-0 opacity-90" />
              <span className="flex-1">{label}</span>
              {href === "/notifications" && unread > 0 ? (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">{unread}</span>
              ) : null}
            </Link>
          ))}

          <div className="my-4 h-px bg-white/10" />

          {secondaryNav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={onClose} className={linkClass(href, true)}>
              <Icon className="size-[17px] shrink-0 opacity-80" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="space-y-3 pt-4">
          <Button
            className="w-full justify-center rounded-xl"
            onClick={() => {
              onClose();
              openCreate();
            }}
          >
            <Plus /> Add Vehicle
          </Button>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 rounded-xl py-2 text-sm text-sidebar-muted transition hover:text-white"
          >
            <LogOut className="size-4" /> Logout
          </Link>
        </div>
      </aside>
    </>
  );
}
