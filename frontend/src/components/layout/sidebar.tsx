import * as React from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ChevronRight, LogOut, Plus, X, type LucideIcon } from "lucide-react";
import { Link, usePathname, useRouter } from "@/lib/navigation";
import { navSections } from "@/constants/navigation";
import { Logo } from "@/components/layout/logo";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useVehicleDialog } from "@/components/vehicles/vehicle-dialog-provider";
import { useLocale } from "@/i18n/locale-context";
import { useAuth } from "@/store/auth-store";
import { useFleet } from "@/store/fleet-store";
import { cn } from "@/lib/utils";

const ACCORDION_MS = 0.22;

function pathMatches(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function sectionForPath(pathname: string) {
  return navSections.find((section) => section.items.some((item) => pathMatches(pathname, item.href)))?.id ?? null;
}

function ChildNavItem({
  href,
  label,
  icon: Icon,
  active,
  badge,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  badge?: number;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg py-2 pl-3 pr-3 text-[13.5px] font-medium",
        "transition-colors duration-150 outline-none",
        "focus-visible:ring-2 focus-visible:ring-primary/40",
        active
          ? "bg-white/[0.08] text-white"
          : "text-sidebar-muted hover:bg-white/[0.04] hover:text-white",
      )}
    >
      {active ? (
        <motion.span
          layoutId="sidebar-active-rail"
          className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      ) : null}
      <Icon
        className={cn("relative z-[1] size-4 shrink-0", active ? "text-white" : "opacity-80")}
        strokeWidth={active ? 2.1 : 1.85}
      />
      <span className="relative z-[1] min-w-0 flex-1 truncate">{label}</span>
      {typeof badge === "number" && badge > 0 ? (
        <span className="relative z-[1] inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-primary px-1.5 text-[10px] font-semibold tabular-nums text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </Link>
  );
}

function SectionRow({
  id,
  label,
  icon: Icon,
  open,
  hasActiveChild,
  onToggle,
  children,
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  open: boolean;
  hasActiveChild: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-1">
      <button
        type="button"
        id={`sidebar-section-${id}`}
        aria-expanded={open}
        aria-controls={`sidebar-panel-${id}`}
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35",
          hasActiveChild || open
            ? "bg-white/[0.06] text-white"
            : "text-sidebar-foreground/90 hover:bg-white/[0.04] hover:text-white",
        )}
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            hasActiveChild || open ? "bg-primary/20 text-primary" : "bg-white/[0.06] text-sidebar-muted",
          )}
        >
          <Icon className="size-[18px]" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1 truncate text-[14px] font-semibold tracking-[-0.01em]">{label}</span>
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: ACCORDION_MS, ease: "easeInOut" }}
          className="flex size-5 shrink-0 items-center justify-center text-sidebar-muted"
        >
          <ChevronRight className="size-4" strokeWidth={2.5} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={`sidebar-panel-${id}`}
            role="region"
            aria-labelledby={`sidebar-section-${id}`}
            key={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: ACCORDION_MS, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="ml-5 mt-1 space-y-0.5 border-l border-white/[0.1] py-1 pl-3">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { openCreate } = useVehicleDialog();
  const { t } = useLocale();
  const { logout } = useAuth();
  const { notifications } = useFleet();
  const unread = notifications.filter((n) => !n.read).length;

  const isActive = (href: string) => pathMatches(pathname, href);

  const [openSectionId, setOpenSectionId] = React.useState<string | null>(() => sectionForPath(pathname));

  React.useEffect(() => {
    const activeSection = sectionForPath(pathname);
    if (activeSection && activeSection !== "main") setOpenSectionId(activeSection);
  }, [pathname]);

  const toggleSection = (id: string) => {
    setOpenSectionId((current) => (current === id ? null : id));
  };

  return (
    <TooltipProvider delayDuration={400}>
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[1px] transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-sidebar flex-col",
          "bg-sidebar text-sidebar-foreground",
          "border-r border-white/[0.05]",
          "transition-transform duration-300 ease-out lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-2 px-4 pb-1 pt-5">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-sidebar-muted transition hover:bg-white/[0.06] hover:text-white lg:hidden"
          >
            <X className="size-5" strokeWidth={1.9} />
          </button>
        </div>

        <LayoutGroup id="sidebar-nav">
          <nav className="mt-5 flex-1 space-y-1 overflow-y-auto px-3 pb-4 [scrollbar-width:thin]" aria-label="Main">
            {navSections.map((section) => {
              const SectionIcon = section.icon;
              const hasActiveChild = section.items.some((item) => isActive(item.href));

              // Dashboard = large direct link
              if (section.id === "main") {
                const item = section.items[0];
                const active = isActive(item.href);
                return (
                  <Link
                    key={section.id}
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5",
                      "transition-colors duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35",
                      active
                        ? "bg-white/[0.08] text-white"
                        : "text-sidebar-foreground/90 hover:bg-white/[0.04] hover:text-white",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        active ? "bg-primary/20 text-primary" : "bg-white/[0.06] text-sidebar-muted",
                      )}
                    >
                      <SectionIcon className="size-[18px]" strokeWidth={2} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[14px] font-semibold tracking-[-0.01em]">
                      {t(`nav.section.${section.id}`)}
                    </span>
                  </Link>
                );
              }

              return (
                <SectionRow
                  key={section.id}
                  id={section.id}
                  label={t(`nav.section.${section.id}`)}
                  icon={SectionIcon}
                  open={openSectionId === section.id}
                  hasActiveChild={hasActiveChild}
                  onToggle={() => toggleSection(section.id)}
                >
                  {section.items.map(({ href, label, icon }) => (
                    <ChildNavItem
                      key={href}
                      href={href}
                      label={t(`nav.${label}`)}
                      icon={icon}
                      active={isActive(href)}
                      badge={href === "/notifications" ? unread : undefined}
                      onNavigate={onClose}
                    />
                  ))}
                </SectionRow>
              );
            })}
          </nav>
        </LayoutGroup>

        <div className="space-y-3 border-t border-white/[0.06] px-3 py-4">
          <button
            type="button"
            className={cn(
              "flex h-11 w-full items-center justify-center gap-2 rounded-xl",
              "bg-primary text-sm font-semibold text-white",
              "shadow-[0_8px_20px_-8px_rgba(37,99,235,0.75)]",
              "transition hover:bg-primary/90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            )}
            onClick={() => {
              onClose();
              openCreate();
            }}
          >
            <Plus className="size-4" strokeWidth={2.5} />
            {t("sidebar.addVehicle")}
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              void logout().finally(() => router.push("/login"));
            }}
            className={cn(
              "flex h-10 w-full items-center gap-3 rounded-lg px-3",
              "text-[13.5px] font-medium text-sidebar-muted",
              "transition hover:bg-white/[0.04] hover:text-white",
            )}
          >
            <LogOut className="size-[18px] opacity-70" strokeWidth={1.9} />
            {t("sidebar.logout")}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
