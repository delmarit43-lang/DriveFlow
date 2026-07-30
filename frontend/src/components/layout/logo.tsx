import { Car } from "lucide-react";
import { Link } from "@/lib/navigation";
import { BRAND } from "@/constants/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function LogoMark({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link
      href="/"
      className={cn(
        "group flex items-center rounded-xl outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary/40",
        collapsed ? "justify-center px-0" : "gap-3 px-1.5",
      )}
      aria-label={BRAND.name}
    >
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground",
          "shadow-[0_1px_0_0_rgba(255,255,255,0.16)_inset,0_4px_12px_-4px_rgba(37,99,235,0.55)]",
          collapsed ? "size-9" : "size-9",
        )}
      >
        <Car className="size-[18px]" strokeWidth={2.25} />
      </span>
      {!collapsed ? (
        <span className="min-w-0">
          <span className="block truncate text-[16px] font-bold leading-tight tracking-[-0.02em] text-white">
            {BRAND.name}
          </span>
          <span className="mt-0.5 block truncate text-[11px] font-medium text-sidebar-muted">
            {BRAND.adminLabel}
          </span>
        </span>
      ) : null}
    </Link>
  );
}

export function Logo({ collapsed }: { collapsed?: boolean }) {
  if (!collapsed) return <LogoMark />;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <LogoMark collapsed />
          </span>
        </TooltipTrigger>
        <TooltipContent side="right">
          <span className="font-semibold">{BRAND.name}</span>
          <span className="mt-0.5 block text-[10px] font-normal text-white/65">{BRAND.adminLabel}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return <span className={cn("text-lg font-bold text-white", className)}>{BRAND.name}</span>;
}
