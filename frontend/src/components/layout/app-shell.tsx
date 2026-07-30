import * as React from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "@/lib/navigation";
import { authRoutes, allNavItems } from "@/constants/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { FloatingActions } from "@/components/layout/floating-actions";
import { useLocale } from "@/i18n/locale-context";
import { useAuth } from "@/store/auth-store";

const searchKeys: Record<string, string> = {
  "/customers": "search.customers",
  "/payments": "search.payments",
  "/notifications": "search.notifications",
  "/revenue": "search.revenue",
  "/vehicles": "search.vehicles",
  "/drivers": "search.drivers",
  "/bookings": "search.bookings",
  "/settings": "search.settings",
};

const titleKeys: Record<string, string> = {
  ...Object.fromEntries(allNavItems.map((item) => [item.href, `nav.${item.label}`])),
  "/": "title.fleetOverview",
  "/login": "title.signIn",
  "/forgot-password": "title.resetPassword",
  "/profile": "title.myProfile",
};

function matchPrefix(pathname: string, table: Record<string, string>) {
  return Object.entries(table)
    .filter(([path]) => path !== "/")
    .find(([path]) => pathname.startsWith(path))?.[1];
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale } = useLocale();
  const { ready, isAuthenticated } = useAuth();
  const [navOpen, setNavOpen] = React.useState(false);
  const isAuth = authRoutes.some((r) => pathname.startsWith(r));

  React.useEffect(() => {
    const key = pathname === "/" ? titleKeys["/"] : matchPrefix(pathname, titleKeys);
    const label = key ? t(key) : null;
    document.title = label ? `${label} · DriveFlow` : t("title.app");
  }, [pathname, locale, t]);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    setNavOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  React.useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated && !isAuth) {
      router.replace("/login");
    } else if (isAuthenticated && isAuth) {
      router.replace("/");
    }
  }, [ready, isAuthenticated, isAuth, router]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (isAuth) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const searchKey = matchPrefix(pathname, searchKeys);
  const placeholder = searchKey ? t(searchKey) : t("search.default");

  return (
    <div className="min-h-screen bg-background lg:pl-sidebar">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="flex min-h-screen flex-col">
        <Topbar placeholder={placeholder} onMenuClick={() => setNavOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <motion.div
            key={`${pathname}-${locale}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
      <FloatingActions />
    </div>
  );
}
