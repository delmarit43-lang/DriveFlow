"use client";

import { Car } from "lucide-react";
import Link from "next/link";
import { BRAND } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3 px-2">
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow">
        <Car className="size-5" strokeWidth={2.25} />
      </span>
      {!collapsed ? (
        <span>
          <span className="block text-lg font-bold tracking-tight text-sidebar-foreground">{BRAND.name}</span>
          <span className="block text-[11px] font-medium uppercase tracking-wider text-sidebar-muted">{BRAND.adminLabel}</span>
        </span>
      ) : null}
    </Link>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("text-lg font-bold text-white", className)}>
      {BRAND.name}
    </span>
  );
}
